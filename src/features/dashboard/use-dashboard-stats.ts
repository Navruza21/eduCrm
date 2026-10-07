import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { branchQueries } from '@/api/centers'
import { groupQueries } from '@/api/groups'
import { invoiceQueries } from '@/api/payments'
import { studentQueries } from '@/api/students'
import { teacherQueries } from '@/api/teachers'
import type { Branch, Group, Invoice, Student, Teacher } from '@/api/types'
import { useCanAccess } from '@/features/auth/hooks'
import { useT } from '@/i18n'
import { shortId } from '@/lib/utils'

/** Categorical chart colors (index.css), checked for color-blind separation in this order. */
const SERIES = Array.from({ length: 8 }, (_, i) => `var(--series-${i + 1})`)
/** Rows without a branch, and a 9th+ branch: a new hue would be indistinguishable — they go gray. */
const SERIES_NONE = 'var(--series-none)'

export type BranchStat = {
  /** null — rows that are not attached to any branch. */
  id: string | null
  name: string
  /** Follows the branch (its place in the branch list), never its rank on a chart. */
  color: string
  students: number
  activeStudents: number
  teachers: number
  groups: number
  /** Fill rate of each group with seats, percent. */
  groupFillRates: number[]
  /** Mean of the groups' fill rates, as the backend's average_fill_rate; null without groups. */
  fillRate: number | null
  /** Over all non-cancelled invoices of the branch. */
  billed: number
  collected: number
  debt: number
  /** collected / billed, percent; null without invoices. */
  collectionRate: number | null
}

export type DashboardStats = ReturnType<typeof useDashboardStats>

/**
 * The backend's /dashboard/ only has center-wide totals. Per-branch numbers are counted here
 * from the lists the role is allowed to read; a source the role can't read stays `available: false`.
 */
export function useDashboardStats() {
  const t = useT()
  const available = {
    branches: useCanAccess('branches'),
    students: useCanAccess('students'),
    groups: useCanAccess('groups'),
    teachers: useCanAccess('teachers'),
    finance: useCanAccess('finance'),
  }

  const branches = useQuery({ ...branchQueries.all(), enabled: available.branches })
  const students = useQuery({ ...studentQueries.all(), enabled: available.students })
  const groups = useQuery({ ...groupQueries.all(), enabled: available.groups })
  const teachers = useQuery({ ...teacherQueries.all(), enabled: available.teachers })
  const invoices = useQuery({ ...invoiceQueries.all(), enabled: available.finance })

  // A disabled query stays "pending" forever — only the enabled ones are waited for.
  const queries = [
    available.branches && branches,
    available.students && students,
    available.groups && groups,
    available.teachers && teachers,
    available.finance && invoices,
  ].filter((query) => query !== false)
  const isPending = queries.some((query) => query.isPending)
  const error = queries.find((query) => query.isError)?.error ?? null

  const noBranch = t.dashboard.branches.noBranch
  const stats = useMemo(
    () =>
      isPending
        ? null
        : summarize({
            branches: branches.data ?? [],
            students: students.data ?? [],
            groups: groups.data ?? [],
            teachers: teachers.data ?? [],
            invoices: invoices.data ?? [],
            noBranch,
          }),
    [isPending, branches.data, students.data, groups.data, teachers.data, invoices.data, noBranch],
  )

  return {
    available,
    isPending,
    error,
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
    ...stats,
  }
}

function summarize(data: {
  branches: Branch[]
  students: Student[]
  groups: Group[]
  teachers: Teacher[]
  invoices: Invoice[]
  noBranch: string
}) {
  const rows = new Map<string | null, BranchStat>()
  const row = (id: string | null): BranchStat => {
    let stat = rows.get(id)
    if (!stat) {
      const index = data.branches.findIndex((branch) => branch.id === id)
      stat = {
        id,
        name: id === null ? data.noBranch : (data.branches[index]?.name ?? shortId(id)),
        color: SERIES[index] ?? SERIES_NONE,
        students: 0,
        activeStudents: 0,
        teachers: 0,
        groups: 0,
        groupFillRates: [],
        fillRate: null,
        billed: 0,
        collected: 0,
        debt: 0,
        collectionRate: null,
      }
      rows.set(id, stat)
    }
    return stat
  }

  // Every branch gets a row — an empty branch is a finding too.
  for (const branch of data.branches) row(branch.id)

  for (const student of data.students) {
    const stat = row(student.branch)
    stat.students++
    if (student.status === 'active') stat.activeStudents++
  }
  for (const teacher of data.teachers) row(teacher.branch).teachers++
  for (const group of data.groups) {
    const stat = row(group.branch)
    stat.groups++
    if (group.capacity > 0) stat.groupFillRates.push((group.enrolled_count / group.capacity) * 100)
  }
  for (const invoice of data.invoices) {
    if (invoice.status === 'cancelled') continue
    const stat = row(invoice.branch)
    stat.billed += Number(invoice.amount)
    stat.collected += Number(invoice.total_paid)
    stat.debt += Number(invoice.outstanding_amount)
  }

  for (const stat of rows.values()) {
    stat.fillRate = mean(stat.groupFillRates)
    stat.collectionRate = stat.billed ? (stat.collected / stat.billed) * 100 : null
  }

  // Branches in the list's order; "no branch" last.
  const branchStats = [...rows.values()].sort((a, b) => Number(a.id === null) - Number(b.id === null))

  const certifiedKnown = data.teachers.some((teacher) => teacher.is_certified !== undefined)

  return {
    branches: branchStats,
    totals: {
      branches: data.branches.length,
      activeBranches: data.branches.filter((branch) => branch.is_active).length,
      students: data.students.length,
      activeStudents: data.students.filter((student) => student.status === 'active').length,
      teachers: data.teachers.length,
      activeTeachers: data.teachers.filter((teacher) => teacher.status === 'active').length,
      /** null until the API sends `is_certified`. */
      certifiedTeachers: certifiedKnown ? data.teachers.filter((teacher) => teacher.is_certified).length : null,
      collected: sum(branchStats, 'collected'),
      billed: sum(branchStats, 'billed'),
      debt: sum(branchStats, 'debt'),
      groups: sum(branchStats, 'groups'),
      fillRate: mean(branchStats.flatMap((stat) => stat.groupFillRates)),
    },
  }
}

const sum = (rows: BranchStat[], key: 'collected' | 'billed' | 'debt' | 'groups') =>
  rows.reduce((total, row) => total + row[key], 0)

const mean = (values: number[]) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : null

export type LeaderMetric = 'collected' | 'activeStudents'

/**
 * The best branch: the most money collected; without finance access (or before any payment),
 * the most active students. "No branch" never wins — it is not a branch.
 */
export function pickLeader(branches: BranchStat[], withFinance: boolean) {
  const candidates = branches.filter((branch) => branch.id !== null)
  const by: LeaderMetric =
    withFinance && candidates.some((branch) => branch.collected > 0) ? 'collected' : 'activeStudents'
  const [branch] = [...candidates].sort((a, b) => b[by] - a[by] || b.activeStudents - a.activeStudents)
  return branch && branch[by] > 0 ? { branch, by } : null
}

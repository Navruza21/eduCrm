import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { branchQueries, courseQueries } from '@/api/centers'
import { groupQueries } from '@/api/groups'
import { studentQueries } from '@/api/students'
import { teacherQueries } from '@/api/teachers'
import { useCanAccess } from '@/features/auth/hooks'
import { shortId } from '@/lib/utils'

/**
 * API rows reference each other by UUID (`invoice.student`, `group.teacher`…).
 * A lookup turns those ids into names and select options — as far as the role
 * is allowed to list the referenced entity.
 */
export type Lookup = {
  /** The role can list this entity; otherwise selects fall back to an id input. */
  available: boolean
  options: { id: string; label: string }[]
  label: (id: string | null) => string
}

function toLookup<T extends { id: string }>(
  available: boolean,
  pending: boolean,
  rows: T[] | undefined,
  toLabel: (row: T) => string,
): Lookup {
  const options = (rows ?? []).map((row) => ({ id: row.id, label: toLabel(row) }))
  const names = new Map(options.map((option) => [option.id, option.label]))

  return {
    available,
    options,
    label: (id) => {
      if (id === null) return '—'
      if (available && pending) return '…'
      return names.get(id) ?? shortId(id)
    },
  }
}

export function useStudentLookup(): Lookup {
  const available = useCanAccess('students')
  const { data, isPending } = useQuery({ ...studentQueries.all(), enabled: available })
  return useMemo(() => toLookup(available, isPending, data, (s) => s.full_name), [available, isPending, data])
}

export function useTeacherLookup(): Lookup {
  const available = useCanAccess('teachers')
  const { data, isPending } = useQuery({ ...teacherQueries.all(), enabled: available })
  return useMemo(() => toLookup(available, isPending, data, (t) => t.full_name), [available, isPending, data])
}

export function useGroupLookup(): Lookup {
  const available = useCanAccess('groups')
  const { data, isPending } = useQuery({ ...groupQueries.all(), enabled: available })
  return useMemo(() => toLookup(available, isPending, data, (g) => g.name), [available, isPending, data])
}

/** Courses are read through center.manage_own — director only. */
export function useCourseLookup(): Lookup {
  const available = useCanAccess('settings')
  const { data, isPending } = useQuery({ ...courseQueries.all(), enabled: available })
  return useMemo(() => toLookup(available, isPending, data, (c) => c.name), [available, isPending, data])
}

/** Branches are read through center.manage_own — director only. */
export function useBranchLookup(): Lookup {
  const available = useCanAccess('settings')
  const { data, isPending } = useQuery({ ...branchQueries.all(), enabled: available })
  return useMemo(() => toLookup(available, isPending, data, (b) => b.name), [available, isPending, data])
}

/** A branch column or field only makes sense when the center has more than one. */
export const hasBranches = (branches: Lookup) => branches.options.length > 1

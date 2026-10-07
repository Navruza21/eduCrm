import { Trophy } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { cn } from '@/lib/utils'
import { Meter } from './kpi-tiles'
import { type BranchStat, type DashboardStats, pickLeader } from './use-dashboard-stats'

type Source = keyof DashboardStats['available']
type MetricKey = 'collected' | 'activeStudents' | 'teachers' | 'fillRate' | 'debt' | 'collectionRate'

const METRICS: { key: MetricKey; source: Source; kind: 'money' | 'number' | 'percent'; lowerIsBetter?: boolean }[] = [
  { key: 'collected', source: 'finance', kind: 'money' },
  { key: 'activeStudents', source: 'students', kind: 'number' },
  { key: 'teachers', source: 'teachers', kind: 'number' },
  { key: 'fillRate', source: 'groups', kind: 'percent' },
  { key: 'collectionRate', source: 'finance', kind: 'percent' },
  { key: 'debt', source: 'finance', kind: 'money', lowerIsBetter: true },
]

type Metric = (typeof METRICS)[number]

function useMetricFormat() {
  const f = useFormat()
  return (metric: Metric, value: number | null) => {
    if (value === null) return '—'
    if (metric.kind === 'money') return f.moneyCompact(value)
    if (metric.kind === 'percent') return f.percent(value)
    return f.number(value)
  }
}

/** Branch comparison — only for a center with several branches (rows "no branch" included). */
export function BranchAnalytics({ stats }: { stats: DashboardStats }) {
  const t = useT()
  const branches = stats.branches ?? []
  const leader = pickLeader(branches, stats.available.finance)
  const metrics = METRICS.filter((metric) => stats.available[metric.source])

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{t.dashboard.branches.title}</h2>
        <p className="text-sm text-muted-foreground">{t.dashboard.branches.subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {leader && <LeaderCard className="lg:col-span-2" leader={leader} stats={stats} />}
        {stats.available.students && (
          <StudentShareCard className={leader ? 'lg:col-span-3' : 'lg:col-span-5'} branches={branches} />
        )}
      </div>

      {metrics.length > 0 && <ComparisonCard branches={branches} metrics={metrics} />}
      <BranchTable branches={branches} stats={stats} leaderId={leader?.branch.id ?? null} />
    </section>
  )
}

function LeaderCard({
  leader: { branch, by },
  stats,
  className,
}: {
  leader: NonNullable<ReturnType<typeof pickLeader>>
  stats: DashboardStats
  className?: string
}) {
  const t = useT()
  const f = useFormat()
  const labels = t.dashboard.branches
  const totalCollected = stats.totals?.collected ?? 0

  // The headline already shows the winning metric — the facts don't repeat it.
  const facts = [
    stats.available.students &&
      (by === 'collected'
        ? { label: labels.metrics.activeStudents, value: f.number(branch.activeStudents) }
        : { label: labels.metrics.students, value: f.number(branch.students) }),
    stats.available.teachers && { label: labels.metrics.teachers, value: f.number(branch.teachers) },
    stats.available.groups && {
      label: labels.metrics.fillRate,
      value: branch.fillRate === null ? '—' : f.percent(branch.fillRate),
    },
    stats.available.finance && {
      label: labels.metrics.collectionRate,
      value: branch.collectionRate === null ? '—' : f.percent(branch.collectionRate),
    },
  ].filter((fact) => fact !== false)

  return (
    <Card className={cn('relative', className)}>
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
      <CardHeader>
        <CardDescription className="flex items-center gap-2 font-medium">
          <span className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient text-white">
            <Trophy className="size-3.5" />
          </span>
          {labels.leader}
        </CardDescription>
        <CardTitle className="mt-1 text-xl font-semibold tracking-tight">{branch.name}</CardTitle>
        <span className="text-xs text-muted-foreground">{labels.leaderBy[by]}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-semibold tracking-tight">
            {by === 'collected' ? f.money(branch.collected) : f.number(branch.activeStudents)}
          </span>
          <span className="text-sm text-muted-foreground">
            {by === 'collected'
              ? labels.shareOfCollected(f.percent((branch.collected / totalCollected) * 100))
              : labels.metrics.activeStudents}
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="text-base font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

/** Part-to-whole: a donut with a 2px surface gap between segments; the center reads the hovered one. */
function StudentShareCard({ branches, className }: { branches: BranchStat[]; className?: string }) {
  const t = useT()
  const f = useFormat()
  const labels = t.dashboard.branches
  const [activeId, setActiveId] = useState<string | null | undefined>(undefined)

  const total = branches.reduce((sum, branch) => sum + branch.students, 0)
  const active = activeId === undefined ? undefined : branches.find((branch) => branch.id === activeId)
  const share = (value: number) => f.percent(total ? (value / total) * 100 : 0)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-semibold">{labels.studentsShare}</CardTitle>
        <CardDescription>{labels.studentsShareHint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative size-44 shrink-0">
          <Donut branches={branches} total={total} activeId={activeId} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="text-3xl font-semibold tracking-tight">{f.number(active ? active.students : total)}</span>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {active ? `${active.name} · ${share(active.students)}` : labels.studentsTotal}
            </span>
          </div>
        </div>

        <ul className="flex w-full min-w-0 flex-col gap-1" onMouseLeave={() => setActiveId(undefined)}>
          {branches.map((branch) => (
            <li
              key={branch.id ?? 'none'}
              tabIndex={0}
              onMouseEnter={() => setActiveId(branch.id)}
              onFocus={() => setActiveId(branch.id)}
              onBlur={() => setActiveId(undefined)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active?.id === branch.id && activeId !== undefined && 'bg-muted',
              )}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: branch.color }} />
              <BranchName branch={branch} className="min-w-0 flex-1 truncate" />
              <span className="font-medium tabular-nums">{f.number(branch.students)}</span>
              <span className="w-14 text-right text-xs text-muted-foreground tabular-nums">
                {share(branch.students)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function Donut({
  branches,
  total,
  activeId,
}: {
  branches: BranchStat[]
  total: number
  activeId: string | null | undefined
}) {
  const radius = 76
  const stroke = 20
  const circumference = 2 * Math.PI * radius
  const parts = branches.filter((branch) => branch.students > 0)
  // The gap is surface, not data: skip it when a single segment closes the ring.
  const gap = parts.length > 1 ? 2.5 : 0

  let offset = 0
  return (
    <svg viewBox="0 0 176 176" className="size-full -rotate-90" aria-hidden>
      <circle cx="88" cy="88" r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
      {total > 0 &&
        parts.map((branch) => {
          const length = (branch.students / total) * circumference
          const dash = Math.max(length - gap, 0.5)
          const segment = (
            <circle
              key={branch.id ?? 'none'}
              cx="88"
              cy="88"
              r={radius}
              fill="none"
              stroke={branch.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              className="transition-opacity duration-200"
              opacity={activeId === undefined || activeId === branch.id ? 1 : 0.25}
            />
          )
          offset += length
          return segment
        })}
    </svg>
  )
}

/** Horizontal bars, one metric at a time, best branch on top; colors stay with their branch. */
function ComparisonCard({ branches, metrics }: { branches: BranchStat[]; metrics: Metric[] }) {
  const t = useT()
  const f = useFormat()
  const format = useMetricFormat()
  const labels = t.dashboard.branches
  const [key, setKey] = useState<MetricKey>(metrics[0].key)
  const metric = metrics.find((m) => m.key === key) ?? metrics[0]

  const value = (branch: BranchStat) => branch[metric.key]
  const rows = [...branches].sort((a, b) => {
    const [va, vb] = [value(a), value(b)]
    if (va === null || vb === null) return Number(va === null) - Number(vb === null)
    return metric.lowerIsBetter ? va - vb : vb - va
  })
  const max = metric.kind === 'percent' ? 100 : Math.max(...rows.map((row) => value(row) ?? 0), 0)
  const total = rows.reduce((sum, row) => sum + (value(row) ?? 0), 0)

  return (
    <Card>
      <CardHeader className="gap-3">
        <div>
          <CardTitle className="font-semibold">{labels.compare}</CardTitle>
          <CardDescription>{labels.compareHint}</CardDescription>
        </div>
        <Tabs value={metric.key} onValueChange={(next) => setKey(next as MetricKey)} className="min-w-0">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <TabsList>
              {metrics.map((m) => (
                <TabsTrigger key={m.key} value={m.key} className="px-3">
                  {labels.metrics[m.key]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col">
          {rows.map((row) => {
            const v = value(row)
            const ratio = v === null || max === 0 ? 0 : Math.min(v / max, 1)
            return (
              <Tooltip key={row.id ?? 'none'}>
                <TooltipTrigger asChild>
                  <li
                    tabIndex={0}
                    className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 rounded-md outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[12rem_minmax(0,1fr)]"
                  >
                    <span className="flex min-w-0 items-center gap-2 py-2 pl-1 text-sm">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ background: row.color }} />
                      <BranchName branch={row} className="truncate" />
                    </span>
                    {/* The bars share one baseline: each row's left hairline joins the next. */}
                    <span className="flex h-full items-center gap-2 border-l border-border py-1.5">
                      <span
                        className="h-4 rounded-r-[4px] transition-[width] duration-500 ease-out"
                        style={{
                          width: `calc((100% - 6.5rem) * ${ratio})`,
                          minWidth: v ? 3 : 0,
                          background: row.color,
                        }}
                      />
                      <span className="text-sm font-medium whitespace-nowrap tabular-nums">{format(metric, v)}</span>
                    </span>
                  </li>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex-col items-start gap-0.5">
                  <span className="text-sm font-semibold">{format(metric, v)}</span>
                  <span className="text-background/75">
                    {row.name}
                    {metric.kind !== 'percent' && v !== null && total > 0 && ` · ${f.percent((v / total) * 100)}`}
                  </span>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}

/** The table twin of the charts: every number, readable without hovering. */
function BranchTable({
  branches,
  stats,
  leaderId,
}: {
  branches: BranchStat[]
  stats: DashboardStats
  leaderId: string | null
}) {
  const t = useT()
  const f = useFormat()
  const labels = t.dashboard.branches
  const { available, totals } = stats
  const percentOrDash = (value: number | null) => (value === null ? '—' : f.percent(value))
  const totalCollection = totals?.billed ? (totals.collected / totals.billed) * 100 : null

  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold">{labels.table}</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">{t.fields.branch}</TableHead>
            {available.students && <TableHead className="text-right">{labels.metrics.students}</TableHead>}
            {available.students && <TableHead className="text-right">{labels.metrics.activeShort}</TableHead>}
            {available.teachers && <TableHead className="text-right">{labels.metrics.teachers}</TableHead>}
            {available.groups && <TableHead className="text-right">{labels.metrics.groups}</TableHead>}
            {available.groups && <TableHead>{labels.metrics.fillRate}</TableHead>}
            {available.finance && <TableHead className="text-right">{labels.metrics.collected}</TableHead>}
            {available.finance && <TableHead className="text-right">{labels.metrics.debt}</TableHead>}
            {available.finance && <TableHead className="pr-4 text-right">{labels.metrics.collectionRate}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody className="tabular-nums">
          {branches.map((branch) => (
            <TableRow key={branch.id ?? 'none'}>
              <TableCell className="pl-4">
                <span className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: branch.color }} />
                  <BranchName branch={branch} className="font-medium" />
                  {branch.id !== null && branch.id === leaderId && (
                    <Trophy aria-label={labels.leader} className="size-3.5 text-primary" />
                  )}
                </span>
              </TableCell>
              {available.students && <TableCell className="text-right">{f.number(branch.students)}</TableCell>}
              {available.students && <TableCell className="text-right">{f.number(branch.activeStudents)}</TableCell>}
              {available.teachers && <TableCell className="text-right">{f.number(branch.teachers)}</TableCell>}
              {available.groups && <TableCell className="text-right">{f.number(branch.groups)}</TableCell>}
              {available.groups && (
                <TableCell>
                  <span className="flex items-center gap-2">
                    <Meter value={branch.fillRate ?? 0} className="w-16" />
                    <span className="w-12 text-xs text-muted-foreground">{percentOrDash(branch.fillRate)}</span>
                  </span>
                </TableCell>
              )}
              {available.finance && <TableCell className="text-right">{f.money(branch.collected)}</TableCell>}
              {available.finance && <TableCell className="text-right">{f.money(branch.debt)}</TableCell>}
              {available.finance && (
                <TableCell className="pr-4 text-right">{percentOrDash(branch.collectionRate)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
        {totals && (
          <TableFooter className="tabular-nums">
            <TableRow>
              <TableCell className="pl-4">{labels.total}</TableCell>
              {available.students && <TableCell className="text-right">{f.number(totals.students)}</TableCell>}
              {available.students && <TableCell className="text-right">{f.number(totals.activeStudents)}</TableCell>}
              {available.teachers && <TableCell className="text-right">{f.number(totals.teachers)}</TableCell>}
              {available.groups && <TableCell className="text-right">{f.number(totals.groups)}</TableCell>}
              {available.groups && (
                <TableCell>
                  <span className="flex items-center gap-2">
                    <Meter value={totals.fillRate ?? 0} className="w-16" />
                    <span className="w-12 text-xs text-muted-foreground">{percentOrDash(totals.fillRate)}</span>
                  </span>
                </TableCell>
              )}
              {available.finance && <TableCell className="text-right">{f.money(totals.collected)}</TableCell>}
              {available.finance && <TableCell className="text-right">{f.money(totals.debt)}</TableCell>}
              {available.finance && <TableCell className="pr-4 text-right">{percentOrDash(totalCollection)}</TableCell>}
            </TableRow>
          </TableFooter>
        )}
        {available.finance && (
          <TableCaption className="mt-0 border-t px-4 py-3 text-left text-xs">{labels.financeNote}</TableCaption>
        )}
      </Table>
    </Card>
  )
}

function BranchName({ branch, className }: { branch: BranchStat; className?: string }) {
  return (
    <span className={cn(branch.id === null && 'text-muted-foreground italic', className)} title={branch.name}>
      {branch.name}
    </span>
  )
}

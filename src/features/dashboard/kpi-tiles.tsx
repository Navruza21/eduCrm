import { BadgeCheck, Building2, GraduationCap, type LucideIcon, UsersRound } from 'lucide-react'
import type { Dashboard } from '@/api/types'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { cn } from '@/lib/utils'
import type { DashboardStats } from './use-dashboard-stats'

/** Icon tiles in the logo's hues; the icon strokes are darker steps so they read on white. */
const TONES = {
  blue: 'bg-brand-blue/10 text-[#1d5ef5]',
  sky: 'bg-brand-sky/15 text-[#0678b0]',
  cyan: 'bg-brand-cyan/15 text-[#08818c]',
  mint: 'bg-brand-mint/20 text-[#06855f]',
}

export function KpiTiles({ summary, stats }: { summary: Dashboard; stats: DashboardStats }) {
  const t = useT()
  const f = useFormat()
  const tiles = t.dashboard.tiles
  const { available, totals } = stats

  if (stats.isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    )
  }

  const certified = totals?.certifiedTeachers ?? null

  return (
    <div className={cn('grid grid-cols-2 gap-3', available.branches ? 'lg:grid-cols-4' : 'lg:grid-cols-3')}>
      {available.students && totals ? (
        <KpiTile
          icon={GraduationCap}
          tone="blue"
          label={tiles.students}
          value={f.number(totals.students)}
          hint={tiles.active(f.number(totals.activeStudents))}
        />
      ) : (
        <KpiTile
          icon={GraduationCap}
          tone="blue"
          label={t.dashboard.kpi.activeStudents}
          value={f.number(summary.active_students)}
        />
      )}

      {available.teachers && totals && (
        <KpiTile
          icon={BadgeCheck}
          tone="mint"
          label={tiles.teachers}
          value={f.number(totals.teachers)}
          hint={
            certified === null
              ? tiles.certifiedNoData
              : tiles.certified(f.number(certified), f.number(totals.teachers))
          }
          meter={certified === null || !totals.teachers ? undefined : (certified / totals.teachers) * 100}
        />
      )}

      {available.branches && totals && (
        <KpiTile
          icon={Building2}
          tone="sky"
          label={tiles.branches}
          value={f.number(totals.branches)}
          hint={tiles.active(f.number(totals.activeBranches))}
        />
      )}

      <KpiTile
        icon={UsersRound}
        tone="cyan"
        label={tiles.groups}
        value={f.number(summary.groups.open_count)}
        hint={tiles.fillRate(f.percent(summary.groups.average_fill_rate))}
        meter={summary.groups.average_fill_rate}
      />
    </div>
  )
}

function KpiTile({
  icon: Icon,
  tone,
  label,
  value,
  hint,
  meter,
}: {
  icon: LucideIcon
  tone: keyof typeof TONES
  label: string
  value: string
  hint?: string
  /** Percent, 0–100: a thin bar under the value. */
  meter?: number
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', TONES[tone])}>
            <Icon className="size-[18px]" />
          </span>
        </div>
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        <div className="mt-auto flex flex-col gap-2">
          {meter !== undefined && <Meter value={meter} />}
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

/** A ratio against 100%: the track is a lighter step of the fill's own hue. */
export function Meter({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-primary/15', className)}>
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

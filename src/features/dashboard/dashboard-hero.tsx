import { CalendarDays, CircleAlert, type LucideIcon, Wallet } from 'lucide-react'
import type { Dashboard } from '@/api/types'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'

/** The month's revenue as the one headline number, on the logo's gradient. */
export function DashboardHero({ summary }: { summary: Dashboard }) {
  const t = useT()
  const f = useFormat()
  const kpi = t.dashboard.kpi

  return (
    <section
      aria-label={t.dashboard.hero.title}
      className="relative isolate overflow-hidden rounded-2xl bg-[#1238c9] p-5 text-white shadow-[0_24px_48px_-28px_rgb(44_99_254/0.8)] md:p-7"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_96%_0%,rgb(8_233_177/0.5),transparent_38%),radial-gradient(circle_at_72%_130%,rgb(16_191_254/0.55),transparent_52%),linear-gradient(120deg,#1238c9_0%,#2c63fe_62%,#1f7cf6_100%)]"
      />
      <TrendArrow className="absolute right-0 bottom-0 -z-10 h-[85%] text-white/12" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
            <CalendarDays className="size-3.5" />
            {f.month(summary.period)}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-white/90">{kpi.monthlyRevenue}</p>
            <p className="text-4xl font-semibold tracking-tight md:text-5xl">{f.money(summary.monthly_revenue)}</p>
            <p className="text-sm text-white/80">{t.dashboard.hero.revenueHint}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:w-md">
          <HeroStat icon={Wallet} label={kpi.totalDebt} value={f.moneyCompact(summary.total_debt)} />
          <HeroStat icon={CircleAlert} label={kpi.overdueInvoices} value={f.number(summary.overdue_invoices_count)} />
        </div>
      </div>
    </section>
  )
}

function HeroStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    // Dark glass: keeps white text readable over the light mint glow.
    <div className="flex flex-col gap-2 rounded-xl bg-[#0c2a8c]/45 p-4 ring-1 ring-white/20 backdrop-blur-md">
      <span className="flex items-center gap-1.5 text-xs font-medium text-white/90">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
    </div>
  )
}

/** The rising arrow of the logo, as a watermark. */
function TrendArrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 240 160" fill="none" className={className}>
      <path d="M8 156C70 150 120 120 160 76c16-18 30-34 44-46" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
      <path d="M176 18l52-12-12 52z" fill="currentColor" />
    </svg>
  )
}

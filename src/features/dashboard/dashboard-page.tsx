import { useQuery } from '@tanstack/react-query'
import { dashboardQueries } from '@/api/dashboard'
import { PageHeader } from '@/components/page-header'
import { QueryView } from '@/components/query-view'
import { StatCard, StatGrid } from '@/components/stat-card'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'

export function DashboardPage() {
  const t = useT()
  const f = useFormat()
  const query = useQuery(dashboardQueries.summary())
  const kpi = t.dashboard.kpi

  return (
    <>
      <PageHeader module="dashboard" />
      <QueryView query={query}>
        {(data) => (
          <section className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t.dashboard.period(f.month(data.period))}</p>
            <StatGrid className="lg:grid-cols-3">
              <StatCard label={kpi.monthlyRevenue} value={f.moneyCompact(data.monthly_revenue)} />
              <StatCard label={kpi.totalDebt} value={f.moneyCompact(data.total_debt)} />
              <StatCard label={kpi.overdueInvoices} value={f.number(data.overdue_invoices_count)} />
              <StatCard label={kpi.activeStudents} value={f.number(data.active_students)} />
              <StatCard label={kpi.openGroups} value={f.number(data.groups.open_count)} />
              <StatCard label={kpi.averageFillRate} value={f.percent(data.groups.average_fill_rate)} />
            </StatGrid>
          </section>
        )}
      </QueryView>
    </>
  )
}

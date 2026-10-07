import { useQuery } from '@tanstack/react-query'
import { CircleAlert } from 'lucide-react'
import { dashboardQueries } from '@/api/dashboard'
import { PageHeader } from '@/components/page-header'
import { QueryView } from '@/components/query-view'
import { Alert, AlertAction, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useErrorText } from '@/hooks/use-error-text'
import { useT } from '@/i18n'
import { BranchAnalytics } from './branch-analytics'
import { DashboardHero } from './dashboard-hero'
import { KpiTiles } from './kpi-tiles'
import { useDashboardStats } from './use-dashboard-stats'

export function DashboardPage() {
  const t = useT()
  const errorText = useErrorText()
  const query = useQuery(dashboardQueries.summary())
  const stats = useDashboardStats()
  // Comparing makes sense with two or more rows — branches plus, if any, "no branch".
  const comparable = stats.available.branches && (stats.branches?.length ?? 0) > 1

  return (
    <>
      <PageHeader module="dashboard" />
      <QueryView query={query}>
        {(summary) => (
          <div className="flex flex-col gap-6">
            <DashboardHero summary={summary} />

            {stats.error ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>{errorText(stats.error)}</AlertTitle>
                <AlertAction>
                  <Button size="sm" variant="outline" onClick={() => stats.refetch()}>
                    {t.common.retry}
                  </Button>
                </AlertAction>
              </Alert>
            ) : (
              <>
                <KpiTiles summary={summary} stats={stats} />
                {stats.isPending && stats.available.branches && <Skeleton className="h-80 rounded-xl" />}
                {comparable && <BranchAnalytics stats={stats} />}
              </>
            )}
          </div>
        )}
      </QueryView>
    </>
  )
}

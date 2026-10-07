import { useQuery } from '@tanstack/react-query'
import { Plus, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/api/client'
import { dashboardQueries } from '@/api/dashboard'
import { invoiceQueries } from '@/api/payments'
import { INVOICE_STATUSES, type Invoice, type InvoiceListParams, type InvoiceStatus } from '@/api/types'
import { DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { QueryView } from '@/components/query-view'
import { StatCard, StatGrid } from '@/components/stat-card'
import { InvoiceStatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCanEdit } from '@/features/auth/hooks'
import { useGroupLookup, useStudentLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { cn } from '@/lib/utils'
import { InvoiceCreatePanel } from './invoice-create-panel'
import { InvoicePanel } from './invoice-panel'

type Filter = 'all' | InvoiceStatus | 'overdue'

const FILTERS: Filter[] = ['all', ...INVOICE_STATUSES, 'overdue']

/** Tab → `?status=` / `?overdue=true`. */
const filterParams = (filter: Filter): InvoiceListParams =>
  filter === 'all' ? {} : filter === 'overdue' ? { overdue: true } : { status: filter }

export function FinancePage() {
  const t = useT()
  const f = useFormat()
  const canEdit = useCanEdit('finance')
  const students = useStudentLookup()
  const groups = useGroupLookup()
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [opened, setOpened] = useState<Invoice | null>(null)
  const query = useQuery(invoiceQueries.list({ ...filterParams(filter), page, page_size: DEFAULT_PAGE_SIZE }))
  // Every finance role also has report.view — the totals come from the dashboard.
  const summary = useQuery(dashboardQueries.summary())

  const filterLabel = (value: Filter) =>
    value === 'all' ? t.finance.allStatuses : value === 'overdue' ? t.finance.overdueFilter : t.finance.statuses[value]

  return (
    <>
      <PageHeader
        module="finance"
        actions={
          canEdit && (
            <Button onClick={() => setCreating(true)}>
              <Plus data-icon="inline-start" />
              {t.finance.addInvoice}
            </Button>
          )
        }
      />

      {summary.data && (
        <StatGrid className="lg:grid-cols-3">
          <StatCard label={t.dashboard.kpi.monthlyRevenue} value={f.moneyCompact(summary.data.monthly_revenue)} />
          <StatCard label={t.dashboard.kpi.totalDebt} value={f.moneyCompact(summary.data.total_debt)} />
          <StatCard
            label={t.dashboard.kpi.overdueInvoices}
            value={f.number(summary.data.overdue_invoices_count)}
          />
        </StatGrid>
      )}

      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(value as Filter)
          setPage(1)
        }}
      >
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList>
            {FILTERS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {filterLabel(value)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <QueryView query={query}>
        {(data) => (
          <div className="flex flex-col gap-3">
            <DataTable
              rows={data.results}
              columns={[
                {
                  id: 'student',
                  header: t.finance.student,
                  cell: (i) => <span className="font-medium">{students.label(i.student)}</span>,
                },
                { id: 'group', header: t.finance.group, cell: (i) => groups.label(i.group) },
                {
                  id: 'period',
                  header: t.finance.period,
                  cell: (i) => f.month(i.period_label),
                  className: 'whitespace-nowrap',
                },
                {
                  id: 'amount',
                  header: t.finance.amount,
                  cell: (i) => f.money(i.amount),
                  className: 'text-right tabular-nums whitespace-nowrap',
                },
                {
                  id: 'paid',
                  header: t.finance.paid,
                  cell: (i) => f.money(i.total_paid),
                  className: 'text-right tabular-nums whitespace-nowrap',
                },
                {
                  id: 'outstanding',
                  header: t.finance.outstanding,
                  cell: (i) => (
                    <span className={cn(i.status !== 'cancelled' && Number(i.outstanding_amount) > 0 && 'text-destructive')}>
                      {f.money(i.outstanding_amount)}
                    </span>
                  ),
                  className: 'text-right tabular-nums whitespace-nowrap',
                },
                {
                  id: 'dueDate',
                  header: t.finance.dueDate,
                  cell: (i) => (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {f.date(i.due_date)}
                      {i.is_overdue && <Badge variant="destructive">{t.finance.overdue}</Badge>}
                    </div>
                  ),
                },
                { id: 'status', header: t.fields.status, cell: (i) => <InvoiceStatusBadge status={i.status} /> },
                {
                  id: 'actions',
                  header: '',
                  className: 'w-0 text-right',
                  cell: (i) => (
                    <Button variant="ghost" size="icon-sm" aria-label={t.common.open} onClick={() => setOpened(i)}>
                      <ReceiptText />
                    </Button>
                  ),
                },
              ]}
            />
            <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} count={data.count} onPageChange={setPage} />
          </div>
        )}
      </QueryView>

      {creating && <InvoiceCreatePanel onClose={() => setCreating(false)} />}
      {opened && <InvoicePanel invoice={opened} onClose={() => setOpened(null)} />}
    </>
  )
}

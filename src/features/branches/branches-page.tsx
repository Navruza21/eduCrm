import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { branchQueries } from '@/api/centers'
import type { Branch } from '@/api/types'
import { DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { QueryView } from '@/components/query-view'
import { ActiveBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCanEdit } from '@/features/auth/hooks'
import { type BranchStat, useDashboardStats } from '@/features/dashboard/use-dashboard-stats'
import { BranchPanel } from '@/features/settings/settings-panels'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'

export function BranchesPage() {
  const t = useT()
  const f = useFormat()
  const canEdit = useCanEdit('branches')
  const query = useQuery(branchQueries.all())
  // The API has no per-branch counts — they are counted from the full lists, as on the dashboard.
  const stats = useDashboardStats()
  /** `'new'` — the create form, a branch — the edit form. */
  const [editing, setEditing] = useState<Branch | 'new' | null>(null)
  const metrics = t.dashboard.branches.metrics

  const count = (branch: Branch, render: (stat: BranchStat) => ReactNode) => {
    if (stats.isPending) return <Skeleton className="ml-auto h-4 w-8" />
    const stat = stats.branches?.find((row) => row.id === branch.id)
    return stat ? render(stat) : '—'
  }

  return (
    <>
      <PageHeader
        module="branches"
        actions={
          canEdit && (
            <Button onClick={() => setEditing('new')}>
              <Plus data-icon="inline-start" />
              {t.branches.add}
            </Button>
          )
        }
      />
      <QueryView query={query}>
        {(branches) => (
          <DataTable
            rows={branches}
            columns={[
              {
                id: 'name',
                header: t.fields.name,
                cell: (b) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{b.name}</span>
                    {b.address && <span className="text-xs text-muted-foreground">{b.address}</span>}
                  </div>
                ),
              },
              { id: 'phone', header: t.fields.phone, cell: (b) => b.phone || '—', className: 'whitespace-nowrap' },
              { id: 'contact', header: t.fields.contactPerson, cell: (b) => b.contact_person || '—' },
              {
                id: 'students',
                header: metrics.students,
                hidden: !stats.available.students,
                className: 'text-right tabular-nums',
                cell: (b) =>
                  count(b, (s) => (
                    <div className="flex flex-col">
                      <span>{f.number(s.students)}</span>
                      <span className="text-xs whitespace-nowrap text-muted-foreground">
                        {t.dashboard.tiles.active(f.number(s.activeStudents))}
                      </span>
                    </div>
                  )),
              },
              {
                id: 'teachers',
                header: metrics.teachers,
                hidden: !stats.available.teachers,
                className: 'text-right tabular-nums',
                cell: (b) => count(b, (s) => f.number(s.teachers)),
              },
              {
                id: 'groups',
                header: metrics.groups,
                hidden: !stats.available.groups,
                className: 'text-right tabular-nums',
                cell: (b) => count(b, (s) => f.number(s.groups)),
              },
              { id: 'status', header: t.fields.status, cell: (b) => <ActiveBadge active={b.is_active} /> },
              {
                id: 'actions',
                header: '',
                hidden: !canEdit,
                className: 'w-0 text-right',
                cell: (b) => (
                  <Button variant="ghost" size="icon-sm" aria-label={t.common.edit} onClick={() => setEditing(b)}>
                    <Pencil />
                  </Button>
                ),
              },
            ]}
          />
        )}
      </QueryView>

      {editing && <BranchPanel branch={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  )
}

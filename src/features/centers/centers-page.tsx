import { useQuery } from '@tanstack/react-query'
import { CircleCheck, Plus, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { centerQueries } from '@/api/centers'
import { DEFAULT_PAGE_SIZE } from '@/api/client'
import type { Center } from '@/api/types'
import { DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { QueryView } from '@/components/query-view'
import { ActiveBadge } from '@/components/status-badge'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { labelOf } from '@/lib/utils'
import { CenterCreatePanel, DirectorPanel } from './center-panels'

/** super_admin: GET/POST /centers/ and director registration. */
export function CentersPage() {
  const t = useT()
  const f = useFormat()
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [directorFor, setDirectorFor] = useState<Center | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const query = useQuery(centerQueries.list({ page, page_size: DEFAULT_PAGE_SIZE }))

  return (
    <>
      <PageHeader
        module="centers"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" />
            {t.centers.add}
          </Button>
        }
      />
      {notice && (
        <Alert>
          <CircleCheck />
          <AlertTitle>{notice}</AlertTitle>
        </Alert>
      )}
      <QueryView query={query}>
        {(data) => (
          <div className="flex flex-col gap-3">
            <DataTable
              rows={data.results}
              columns={[
                {
                  id: 'name',
                  header: t.fields.name,
                  cell: (c) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{c.name}</span>
                      {c.address && <span className="text-xs text-muted-foreground">{c.address}</span>}
                    </div>
                  ),
                },
                { id: 'phone', header: t.fields.phone, cell: (c) => c.phone || '—', className: 'whitespace-nowrap' },
                { id: 'contact', header: t.fields.contactPerson, cell: (c) => c.contact_person || '—' },
                {
                  id: 'contract',
                  header: t.settings.contractStatus,
                  cell: (c) => (
                    <Badge variant="outline">{labelOf(t.settings.contractStatuses, c.contract_status)}</Badge>
                  ),
                },
                {
                  id: 'tier',
                  header: t.settings.subscriptionTier,
                  cell: (c) => labelOf(t.settings.subscriptionTiers, c.subscription_tier),
                },
                { id: 'status', header: t.fields.status, cell: (c) => <ActiveBadge active={c.is_active} /> },
                {
                  id: 'createdAt',
                  header: t.fields.createdAt,
                  cell: (c) => f.date(c.created_at),
                  className: 'whitespace-nowrap',
                },
                {
                  id: 'actions',
                  header: '',
                  className: 'w-0 text-right',
                  cell: (c) => (
                    <Button variant="outline" size="sm" onClick={() => setDirectorFor(c)}>
                      <UserPlus data-icon="inline-start" />
                      {t.centers.addDirector}
                    </Button>
                  ),
                },
              ]}
            />
            <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} count={data.count} onPageChange={setPage} />
          </div>
        )}
      </QueryView>

      {creating && <CenterCreatePanel onClose={() => setCreating(false)} />}
      {directorFor && (
        <DirectorPanel
          center={directorFor}
          onClose={() => setDirectorFor(null)}
          onCreated={(username) => setNotice(t.centers.directorCreated(username))}
        />
      )}
    </>
  )
}

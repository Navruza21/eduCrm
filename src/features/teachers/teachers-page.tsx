import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/api/client'
import { teacherQueries } from '@/api/teachers'
import type { Teacher } from '@/api/types'
import { DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { QueryView } from '@/components/query-view'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCanEdit } from '@/features/auth/hooks'
import { hasBranches, useBranchLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { labelOf } from '@/lib/utils'
import { TeacherPanel } from './teacher-panel'

export function TeachersPage() {
  const t = useT()
  const f = useFormat()
  const canEdit = useCanEdit('teachers')
  const branches = useBranchLookup()
  const [page, setPage] = useState(1)
  /** `'new'` — the create form, a teacher — the edit form. */
  const [editing, setEditing] = useState<Teacher | 'new' | null>(null)
  const query = useQuery(teacherQueries.list({ page, page_size: DEFAULT_PAGE_SIZE }))

  return (
    <>
      <PageHeader
        module="teachers"
        actions={
          canEdit && (
            <Button onClick={() => setEditing('new')}>
              <Plus data-icon="inline-start" />
              {t.teachers.add}
            </Button>
          )
        }
      />
      <QueryView query={query}>
        {(data) => (
          <div className="flex flex-col gap-3">
            <DataTable
              rows={data.results}
              columns={[
                {
                  id: 'name',
                  header: t.fields.fullName,
                  cell: (r) => <span className="font-medium">{r.full_name}</span>,
                },
                { id: 'subjects', header: t.teachers.subjects, cell: (r) => r.subjects || '—' },
                { id: 'phone', header: t.fields.phone, cell: (r) => r.phone || '—', className: 'whitespace-nowrap' },
                {
                  id: 'branch',
                  header: t.fields.branch,
                  hidden: !hasBranches(branches),
                  cell: (r) => branches.label(r.branch),
                },
                {
                  id: 'groups',
                  header: t.teachers.groups,
                  cell: (r) => f.number(r.group_count),
                  className: 'text-right tabular-nums',
                },
                {
                  id: 'students',
                  header: t.teachers.students,
                  cell: (r) => f.number(r.active_student_count),
                  className: 'text-right tabular-nums',
                },
                {
                  id: 'revenue',
                  header: t.teachers.monthlyRevenue,
                  cell: (r) => f.money(r.monthly_revenue),
                  className: 'text-right tabular-nums whitespace-nowrap',
                },
                {
                  id: 'status',
                  header: t.fields.status,
                  cell: (r) => (
                    <Badge variant={r.status === 'active' ? 'secondary' : 'ghost'}>
                      {labelOf(t.teachers.statuses, r.status)}
                    </Badge>
                  ),
                },
                {
                  id: 'actions',
                  header: '',
                  hidden: !canEdit,
                  className: 'w-0 text-right',
                  cell: (r) => (
                    <Button variant="ghost" size="icon-sm" aria-label={t.common.edit} onClick={() => setEditing(r)}>
                      <Pencil />
                    </Button>
                  ),
                },
              ]}
            />
            <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} count={data.count} onPageChange={setPage} />
          </div>
        )}
      </QueryView>

      {editing && (
        <TeacherPanel teacher={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}

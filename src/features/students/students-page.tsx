import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/api/client'
import { studentQueries } from '@/api/students'
import type { Student } from '@/api/types'
import { DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { QueryView } from '@/components/query-view'
import { StudentStatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { useCanEdit } from '@/features/auth/hooks'
import { hasBranches, useBranchLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { StudentCreatePanel, StudentEditPanel } from './student-panels'

export function StudentsPage() {
  const t = useT()
  const f = useFormat()
  const canEdit = useCanEdit('students')
  const branches = useBranchLookup()
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const query = useQuery(studentQueries.list({ page, page_size: DEFAULT_PAGE_SIZE }))

  return (
    <>
      <PageHeader
        module="students"
        actions={
          canEdit && (
            <Button onClick={() => setCreating(true)}>
              <Plus data-icon="inline-start" />
              {t.students.add}
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
                  cell: (s) => (
                    <div className="flex max-w-64 flex-col">
                      <span className="font-medium">{s.full_name}</span>
                      {s.notes && <span className="truncate text-xs text-muted-foreground">{s.notes}</span>}
                    </div>
                  ),
                },
                { id: 'phone', header: t.fields.phone, cell: (s) => s.phone, className: 'whitespace-nowrap' },
                {
                  id: 'platformId',
                  header: t.students.platformId,
                  cell: (s) => s.platform_student_id || '—',
                  className: 'font-mono text-xs',
                },
                {
                  id: 'branch',
                  header: t.fields.branch,
                  hidden: !hasBranches(branches),
                  cell: (s) => branches.label(s.branch),
                },
                {
                  id: 'status',
                  header: t.fields.status,
                  cell: (s) => <StudentStatusBadge status={s.status} />,
                },
                {
                  id: 'enrolledAt',
                  header: t.students.enrolledAt,
                  cell: (s) => f.date(s.enrolled_at),
                  className: 'whitespace-nowrap',
                },
                {
                  id: 'actions',
                  header: '',
                  hidden: !canEdit,
                  className: 'w-0 text-right',
                  cell: (s) => (
                    <Button variant="ghost" size="icon-sm" aria-label={t.common.edit} onClick={() => setEditing(s)}>
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

      {creating && <StudentCreatePanel onClose={() => setCreating(false)} />}
      {editing && <StudentEditPanel student={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

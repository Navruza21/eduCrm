import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/api/client'
import { groupQueries } from '@/api/groups'
import type { Group } from '@/api/types'
import { DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { QueryView } from '@/components/query-view'
import { GroupStatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCanEdit } from '@/features/auth/hooks'
import { hasBranches, useBranchLookup, useCourseLookup, useTeacherLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { GroupMembersPanel } from './group-members-panel'
import { GroupPanel } from './group-panel'

export function GroupsPage() {
  const t = useT()
  const f = useFormat()
  const canEdit = useCanEdit('groups')
  const teachers = useTeacherLookup()
  const courses = useCourseLookup()
  const branches = useBranchLookup()
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Group | 'new' | null>(null)
  const [members, setMembers] = useState<Group | null>(null)
  const query = useQuery(groupQueries.list({ page, page_size: DEFAULT_PAGE_SIZE }))

  return (
    <>
      <PageHeader
        module="groups"
        actions={
          canEdit && (
            <Button onClick={() => setEditing('new')}>
              <Plus data-icon="inline-start" />
              {t.groups.add}
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
                  header: t.fields.name,
                  cell: (g) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{g.name}</span>
                      {g.schedule_note && (
                        <span className="text-xs text-muted-foreground">{g.schedule_note}</span>
                      )}
                    </div>
                  ),
                },
                {
                  id: 'course',
                  header: t.groups.course,
                  // Courses are director-only in the API; other roles would see bare ids.
                  hidden: !courses.available,
                  cell: (g) => courses.label(g.course),
                },
                { id: 'teacher', header: t.groups.teacher, cell: (g) => teachers.label(g.teacher) },
                {
                  id: 'branch',
                  header: t.fields.branch,
                  hidden: !hasBranches(branches),
                  cell: (g) => branches.label(g.branch),
                },
                {
                  id: 'fill',
                  header: t.groups.fill,
                  cell: (g) => (
                    <div className="flex min-w-32 items-center gap-2">
                      <Progress value={g.capacity ? (g.enrolled_count / g.capacity) * 100 : 0} className="w-20" />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {g.enrolled_count}/{g.capacity}
                      </span>
                    </div>
                  ),
                },
                {
                  id: 'price',
                  header: t.groups.monthlyPrice,
                  cell: (g) => f.money(g.monthly_price),
                  className: 'text-right tabular-nums whitespace-nowrap',
                },
                { id: 'status', header: t.fields.status, cell: (g) => <GroupStatusBadge status={g.status} /> },
                {
                  id: 'actions',
                  header: '',
                  className: 'w-0 text-right whitespace-nowrap',
                  cell: (g) => (
                    <>
                      <Button variant="ghost" size="icon-sm" aria-label={t.groups.members} onClick={() => setMembers(g)}>
                        <Users />
                      </Button>
                      {canEdit && (
                        <Button variant="ghost" size="icon-sm" aria-label={t.common.edit} onClick={() => setEditing(g)}>
                          <Pencil />
                        </Button>
                      )}
                    </>
                  ),
                },
              ]}
            />
            <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} count={data.count} onPageChange={setPage} />
          </div>
        )}
      </QueryView>

      {editing && <GroupPanel group={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {members && <GroupMembersPanel group={members} onClose={() => setMembers(null)} />}
    </>
  )
}

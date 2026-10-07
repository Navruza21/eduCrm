import { useMutation, useQuery } from '@tanstack/react-query'
import { UserMinus } from 'lucide-react'
import { groupQueries, groupsApi } from '@/api/groups'
import type { Group } from '@/api/types'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { FormError, LookupSelect } from '@/components/form'
import { Panel } from '@/components/panel'
import { QueryView } from '@/components/query-view'
import { StudentStatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useCanEdit } from '@/features/auth/hooks'
import { useInvalidate } from '@/hooks/use-invalidate'
import { useStudentLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { field } from '@/lib/form'

/** GET/POST /groups/<id>/enrollments/ and DELETE /groups/<id>/enrollments/<id>/. */
export function GroupMembersPanel({ group, onClose }: { group: Group; onClose: () => void }) {
  const t = useT()
  const canEdit = useCanEdit('groups')
  const students = useStudentLookup()
  const invalidate = useInvalidate()
  const query = useQuery(groupQueries.enrollments(group.id))

  // Seats, fill rate and teacher stats are computed from enrollments on the server.
  const refresh = () => invalidate('groups', 'teachers', 'dashboard')
  const enroll = useMutation({
    mutationFn: (student: string) => groupsApi.enroll(group.id, { student }),
    onSuccess: refresh,
  })
  const unenroll = useMutation({
    mutationFn: (enrollmentId: string) => groupsApi.unenroll(group.id, enrollmentId),
    onSuccess: refresh,
  })

  const enrollments = query.data ?? []
  const enrolled = enrollments.filter((e) => !e.is_waitlisted).length
  const enrolledIds = new Set(enrollments.map((e) => e.student.id))

  return (
    <Panel
      title={`${group.name} · ${t.groups.members}`}
      description={`${t.groups.fill}: ${enrolled}/${group.capacity} · ${t.groups.seatsLeft(Math.max(group.capacity - enrolled, 0))}`}
      onClose={onClose}
    >
      {canEdit && (
        <form
          className="flex flex-col gap-2 rounded-lg border p-3"
          onSubmit={(event) => {
            event.preventDefault()
            const form = event.currentTarget
            enroll.mutate(field(new FormData(form), 'student'), { onSuccess: () => form.reset() })
          }}
        >
          <Label htmlFor="enroll-student">{t.groups.student}</Label>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <LookupSelect id="enroll-student" name="student" lookup={students} exclude={enrolledIds} required />
            </div>
            <Button type="submit" disabled={enroll.isPending}>
              {t.groups.enroll}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t.groups.enrollHint}</p>
          <FormError error={enroll.error} labels={{ student: t.groups.student }} />
        </form>
      )}

      <FormError error={unenroll.error} />

      <QueryView query={query} skeleton="list">
        {(rows) =>
          rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t.groups.noMembers}</p>
          ) : (
            <ul className="flex flex-col divide-y rounded-lg border">
              {rows.map((enrollment) => (
                <li key={enrollment.id} className="flex items-center gap-3 p-3">
                  <div className="grid min-w-0 flex-1 text-sm">
                    <span className="truncate font-medium">{enrollment.student.full_name}</span>
                    <span className="text-xs text-muted-foreground">{enrollment.student.phone}</span>
                  </div>
                  {enrollment.is_waitlisted && <Badge variant="outline">{t.groups.waitlisted}</Badge>}
                  <StudentStatusBadge status={enrollment.student.status} />
                  {canEdit && (
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t.common.remove}
                          disabled={unenroll.isPending}
                        >
                          <UserMinus />
                        </Button>
                      }
                      title={t.groups.removeTitle}
                      description={t.groups.removeText(enrollment.student.full_name)}
                      confirmLabel={t.common.remove}
                      onConfirm={() => unenroll.mutate(enrollment.id)}
                    />
                  )}
                </li>
              ))}
            </ul>
          )
        }
      </QueryView>
    </Panel>
  )
}

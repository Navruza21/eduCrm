import { useMutation } from '@tanstack/react-query'
import { groupsApi } from '@/api/groups'
import { GROUP_STATUSES, type Group, type GroupStatus } from '@/api/types'
import { Field, LookupSelect } from '@/components/form'
import { FormPanel } from '@/components/panel'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useInvalidate } from '@/hooks/use-invalidate'
import { hasBranches, useBranchLookup, useCourseLookup, useTeacherLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { field, nullableField, optionalField } from '@/lib/form'

/** Create (POST) when `group` is null, edit (PATCH) otherwise. */
export function GroupPanel({ group, onClose }: { group: Group | null; onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()
  const teachers = useTeacherLookup()
  const courses = useCourseLookup()
  const branches = useBranchLookup()

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const common = {
        name: field(data, 'name'),
        capacity: Number(field(data, 'capacity')),
        monthly_price: field(data, 'monthly_price'),
        schedule_note: field(data, 'schedule_note'),
        branch: optionalField(data, 'branch'),
      }
      return group
        ? groupsApi.update(group.id, {
            ...common,
            // Only send relations the form showed — a hidden select must not clear them.
            ...(courses.available && { course: nullableField(data, 'course') }),
            ...(teachers.available && { teacher: nullableField(data, 'teacher') }),
            status: field(data, 'status') as GroupStatus,
          })
        : groupsApi.create({
            ...common,
            course: optionalField(data, 'course'),
            teacher: optionalField(data, 'teacher'),
          })
    },
    onSuccess: () => {
      invalidate('groups', 'teachers', 'dashboard')
      onClose()
    },
  })

  return (
    <FormPanel
      title={group?.name ?? t.groups.add}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{
        name: t.fields.name,
        capacity: t.groups.capacity,
        monthly_price: t.groups.monthlyPrice,
        course: t.groups.course,
        teacher: t.groups.teacher,
        branch: t.fields.branch,
        schedule_note: t.groups.schedule,
        status: t.fields.status,
      }}
      onSubmit={(data) => mutation.mutate(data)}
    >
      <Field label={t.fields.name} htmlFor="group-name">
        <Input id="group-name" name="name" defaultValue={group?.name} placeholder="Ingliz-A1" required autoFocus />
      </Field>
      {courses.available && (
        <Field label={t.groups.course} htmlFor="group-course" optional>
          <LookupSelect id="group-course" name="course" lookup={courses} defaultValue={group?.course} />
        </Field>
      )}
      <Field label={t.groups.teacher} htmlFor="group-teacher" optional>
        <LookupSelect id="group-teacher" name="teacher" lookup={teachers} defaultValue={group?.teacher} />
      </Field>
      {hasBranches(branches) && (
        <Field label={t.fields.branch} htmlFor="group-branch" optional>
          <LookupSelect id="group-branch" name="branch" lookup={branches} defaultValue={group?.branch} />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.groups.capacity} htmlFor="group-capacity">
          <Input
            id="group-capacity"
            name="capacity"
            type="number"
            min={1}
            step={1}
            defaultValue={group?.capacity ?? 10}
            required
          />
        </Field>
        <Field label={t.groups.monthlyPrice} htmlFor="group-price">
          <Input
            id="group-price"
            name="monthly_price"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            defaultValue={group ? Number(group.monthly_price) : undefined}
            required
          />
        </Field>
      </div>
      <Field label={t.groups.schedule} htmlFor="group-schedule" hint={t.groups.scheduleHint} optional>
        <Input id="group-schedule" name="schedule_note" defaultValue={group?.schedule_note} />
      </Field>
      {group && (
        <Field label={t.fields.status} htmlFor="group-status">
          <NativeSelect id="group-status" name="status" defaultValue={group.status} className="w-full">
            {GROUP_STATUSES.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {t.groups.statuses[status]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      )}
    </FormPanel>
  )
}

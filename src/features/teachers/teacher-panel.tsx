import { useMutation } from '@tanstack/react-query'
import { teachersApi } from '@/api/teachers'
import type { Teacher, TeacherCreate, TeacherUpdate } from '@/api/types'
import { Field, LookupSelect } from '@/components/form'
import { FormPanel } from '@/components/panel'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useInvalidate } from '@/hooks/use-invalidate'
import { hasBranches, useBranchLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { field, optionalField } from '@/lib/form'

/** Create (POST) when `teacher` is null, edit (PATCH) otherwise. Director only. */
export function TeacherPanel({ teacher, onClose }: { teacher: Teacher | null; onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()
  const branches = useBranchLookup()

  const mutation = useMutation({
    mutationFn: (body: TeacherCreate & TeacherUpdate) =>
      teacher ? teachersApi.update(teacher.id, body) : teachersApi.create(body),
    onSuccess: () => {
      invalidate('teachers')
      onClose()
    },
  })

  return (
    <FormPanel
      title={teacher?.full_name ?? t.teachers.add}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{
        full_name: t.fields.fullName,
        phone: t.fields.phone,
        subjects: t.teachers.subjects,
        branch: t.fields.branch,
        notes: t.fields.notes,
      }}
      onSubmit={(data) =>
        mutation.mutate({
          full_name: field(data, 'full_name'),
          phone: field(data, 'phone'),
          subjects: field(data, 'subjects'),
          branch: optionalField(data, 'branch'),
          notes: field(data, 'notes'),
        })
      }
    >
      <Field label={t.fields.fullName} htmlFor="teacher-name">
        <Input id="teacher-name" name="full_name" defaultValue={teacher?.full_name} required autoFocus />
      </Field>
      <Field label={t.fields.phone} htmlFor="teacher-phone" optional>
        <Input id="teacher-phone" name="phone" type="tel" defaultValue={teacher?.phone} />
      </Field>
      <Field label={t.teachers.subjects} htmlFor="teacher-subjects" hint={t.teachers.subjectsHint} optional>
        <Input id="teacher-subjects" name="subjects" defaultValue={teacher?.subjects} />
      </Field>
      {hasBranches(branches) && (
        <Field label={t.fields.branch} htmlFor="teacher-branch" optional>
          <LookupSelect id="teacher-branch" name="branch" lookup={branches} defaultValue={teacher?.branch} />
        </Field>
      )}
      <Field label={t.fields.notes} htmlFor="teacher-notes" optional>
        <Textarea id="teacher-notes" name="notes" defaultValue={teacher?.notes} rows={3} />
      </Field>
    </FormPanel>
  )
}

import { useMutation } from '@tanstack/react-query'
import { studentsApi } from '@/api/students'
import { STUDENT_STATUSES, type Student, type StudentCreate, type StudentStatus, type StudentUpdate } from '@/api/types'
import { Field, LookupSelect } from '@/components/form'
import { FormPanel } from '@/components/panel'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useInvalidate } from '@/hooks/use-invalidate'
import { hasBranches, useBranchLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { field, optionalField } from '@/lib/form'

export function StudentCreatePanel({ onClose }: { onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()
  const branches = useBranchLookup()

  const mutation = useMutation({
    mutationFn: (body: StudentCreate) => studentsApi.create(body),
    onSuccess: () => {
      invalidate('students', 'dashboard')
      onClose()
    },
  })

  return (
    <FormPanel
      title={t.students.add}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{
        full_name: t.fields.fullName,
        phone: t.fields.phone,
        platform_student_id: t.students.platformId,
        branch: t.fields.branch,
      }}
      onSubmit={(data) =>
        mutation.mutate({
          full_name: field(data, 'full_name'),
          phone: field(data, 'phone'),
          platform_student_id: optionalField(data, 'platform_student_id'),
          branch: optionalField(data, 'branch'),
        })
      }
    >
      <Field label={t.fields.fullName} htmlFor="student-name">
        <Input id="student-name" name="full_name" required autoFocus />
      </Field>
      <Field label={t.fields.phone} htmlFor="student-phone" hint={t.students.phoneHint}>
        <Input id="student-phone" name="phone" type="tel" placeholder="901234567" required />
      </Field>
      <Field label={t.students.platformId} htmlFor="student-platform-id" optional>
        <Input id="student-platform-id" name="platform_student_id" />
      </Field>
      {hasBranches(branches) && (
        <Field label={t.fields.branch} htmlFor="student-branch" optional>
          <LookupSelect id="student-branch" name="branch" lookup={branches} />
        </Field>
      )}
    </FormPanel>
  )
}

/** PATCH /students/<id>/ takes only `status` and `notes`. */
export function StudentEditPanel({ student, onClose }: { student: Student; onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()

  const mutation = useMutation({
    mutationFn: (body: StudentUpdate) => studentsApi.update(student.id, body),
    onSuccess: () => {
      // Status changes the active-student count and the enrollment lists.
      invalidate('students', 'groups', 'dashboard', 'teachers')
      onClose()
    },
  })

  return (
    <FormPanel
      title={student.full_name}
      description={t.students.editHint}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{ status: t.fields.status, notes: t.fields.notes }}
      onSubmit={(data) =>
        mutation.mutate({ status: field(data, 'status') as StudentStatus, notes: field(data, 'notes') })
      }
    >
      <Field label={t.fields.status} htmlFor="student-status">
        <NativeSelect id="student-status" name="status" defaultValue={student.status} className="w-full">
          {STUDENT_STATUSES.map((status) => (
            <NativeSelectOption key={status} value={status}>
              {t.students.statuses[status]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field label={t.fields.notes} htmlFor="student-notes" optional>
        <Textarea id="student-notes" name="notes" defaultValue={student.notes} rows={4} />
      </Field>
    </FormPanel>
  )
}

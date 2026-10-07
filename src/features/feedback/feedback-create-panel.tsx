import { useMutation } from '@tanstack/react-query'
import { feedbackApi } from '@/api/feedback'
import type { FeedbackCreate } from '@/api/types'
import { Field, LookupSelect } from '@/components/form'
import { FormPanel } from '@/components/panel'
import { RatingInput } from '@/components/rating'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useInvalidate } from '@/hooks/use-invalidate'
import { useStudentLookup, useTeacherLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { field, optionalField } from '@/lib/form'

/** Feedback entered by staff, e.g. a complaint that came by phone. */
export function FeedbackCreatePanel({ onClose }: { onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()
  const students = useStudentLookup()
  const teachers = useTeacherLookup()

  const mutation = useMutation({
    mutationFn: (body: FeedbackCreate) => feedbackApi.create(body),
    onSuccess: () => {
      invalidate('feedback')
      onClose()
    },
  })

  return (
    <FormPanel
      title={t.feedback.add}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{
        student: t.feedback.student,
        rating: t.feedback.rating,
        comment: t.feedback.comment,
        teacher_name: t.feedback.teacher,
      }}
      onSubmit={(data) =>
        mutation.mutate({
          student: field(data, 'student'),
          rating: Number(field(data, 'rating')),
          comment: field(data, 'comment'),
          teacher_name: optionalField(data, 'teacher_name'),
        })
      }
    >
      <Field label={t.feedback.student} htmlFor="feedback-student">
        <LookupSelect id="feedback-student" name="student" lookup={students} required />
      </Field>
      <div className="grid gap-2">
        <Label>{t.feedback.rating}</Label>
        <RatingInput name="rating" label={t.feedback.rating} />
      </div>
      <Field label={t.feedback.comment} htmlFor="feedback-comment">
        <Textarea id="feedback-comment" name="comment" rows={4} required />
      </Field>
      {/* teacher_name is free text in the API; teacher names are only suggestions. */}
      <Field label={t.feedback.teacher} htmlFor="feedback-teacher" optional>
        <Input id="feedback-teacher" name="teacher_name" list="feedback-teacher-names" />
        <datalist id="feedback-teacher-names">
          {teachers.options.map((option) => (
            <option key={option.id} value={option.label} />
          ))}
        </datalist>
      </Field>
    </FormPanel>
  )
}

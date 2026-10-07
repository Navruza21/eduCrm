import { useMutation } from '@tanstack/react-query'
import { branchesApi, centersApi, coursesApi } from '@/api/centers'
import type { Branch, Center, CenterCreate, Course } from '@/api/types'
import { Field } from '@/components/form'
import { FormPanel } from '@/components/panel'
import { Input } from '@/components/ui/input'
import { useInvalidate } from '@/hooks/use-invalidate'
import { useT } from '@/i18n'
import { checkboxField, field } from '@/lib/form'

/** PATCH /centers/me/ */
export function CenterPanel({ center, onClose }: { center: Center; onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()

  const mutation = useMutation({
    mutationFn: (body: CenterCreate) => centersApi.updateMe(body),
    onSuccess: () => {
      invalidate('centers')
      onClose()
    },
  })

  return (
    <FormPanel
      title={t.settings.editCenter}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{
        name: t.fields.name,
        phone: t.fields.phone,
        address: t.fields.address,
        contact_person: t.fields.contactPerson,
      }}
      onSubmit={(data) =>
        mutation.mutate({
          name: field(data, 'name'),
          phone: field(data, 'phone'),
          address: field(data, 'address'),
          contact_person: field(data, 'contact_person'),
        })
      }
    >
      <ContactFields idPrefix="center" values={center} />
    </FormPanel>
  )
}

/** POST /centers/branches/ when `branch` is null, PATCH /centers/branches/<id>/ otherwise. */
export function BranchPanel({ branch, onClose }: { branch: Branch | null; onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const body = {
        name: field(data, 'name'),
        phone: field(data, 'phone'),
        address: field(data, 'address'),
        contact_person: field(data, 'contact_person'),
      }
      return branch
        ? branchesApi.update(branch.id, { ...body, is_active: checkboxField(data, 'is_active') })
        : branchesApi.create(body)
    },
    onSuccess: () => {
      invalidate('branches')
      onClose()
    },
  })

  return (
    <FormPanel
      title={branch?.name ?? t.branches.add}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{
        name: t.fields.name,
        phone: t.fields.phone,
        address: t.fields.address,
        contact_person: t.fields.contactPerson,
        is_active: t.fields.active,
      }}
      onSubmit={(data) => mutation.mutate(data)}
    >
      <ContactFields idPrefix="branch" values={branch} />
      {branch && <ActiveCheckbox id="branch-active" defaultChecked={branch.is_active} />}
    </FormPanel>
  )
}

/** POST /centers/courses/ when `course` is null, PATCH /centers/courses/<id>/ otherwise. */
export function CoursePanel({ course, onClose }: { course: Course | null; onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      course
        ? coursesApi.update(course.id, { name: field(data, 'name'), is_active: checkboxField(data, 'is_active') })
        : coursesApi.create({ name: field(data, 'name') }),
    onSuccess: () => {
      invalidate('courses')
      onClose()
    },
  })

  return (
    <FormPanel
      title={course?.name ?? t.settings.addCourse}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{ name: t.fields.name, is_active: t.fields.active }}
      onSubmit={(data) => mutation.mutate(data)}
    >
      <Field label={t.fields.name} htmlFor="course-name" hint={t.settings.courseHint}>
        <Input id="course-name" name="name" defaultValue={course?.name} placeholder="Ingliz tili" required autoFocus />
      </Field>
      {course && <ActiveCheckbox id="course-active" defaultChecked={course.is_active} />}
    </FormPanel>
  )
}

/** name / phone / address / contact_person — the same four fields on centers and branches. */
export function ContactFields({
  idPrefix,
  values,
}: {
  idPrefix: string
  values: Pick<Center, 'name' | 'phone' | 'address' | 'contact_person'> | null
}) {
  const t = useT()

  return (
    <>
      <Field label={t.fields.name} htmlFor={`${idPrefix}-name`}>
        <Input id={`${idPrefix}-name`} name="name" defaultValue={values?.name} required autoFocus />
      </Field>
      <Field label={t.fields.phone} htmlFor={`${idPrefix}-phone`} optional>
        <Input id={`${idPrefix}-phone`} name="phone" type="tel" defaultValue={values?.phone} />
      </Field>
      <Field label={t.fields.address} htmlFor={`${idPrefix}-address`} optional>
        <Input id={`${idPrefix}-address`} name="address" defaultValue={values?.address} />
      </Field>
      <Field label={t.fields.contactPerson} htmlFor={`${idPrefix}-contact`} optional>
        <Input id={`${idPrefix}-contact`} name="contact_person" defaultValue={values?.contact_person} />
      </Field>
    </>
  )
}

function ActiveCheckbox({ id, defaultChecked }: { id: string; defaultChecked: boolean }) {
  const t = useT()

  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
      <input id={id} name="is_active" type="checkbox" defaultChecked={defaultChecked} className="size-4 accent-primary" />
      {t.fields.active}
    </label>
  )
}

import { Field } from '@/components/form'
import { Input } from '@/components/ui/input'
import { useT } from '@/i18n'

/** Login and profile fields of POST /auth/register/ — shared by staff and director registration. */
export function UserFields({ idPrefix }: { idPrefix: string }) {
  const t = useT()

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.fields.username} htmlFor={`${idPrefix}-username`}>
          <Input id={`${idPrefix}-username`} name="username" autoComplete="off" autoCapitalize="none" required />
        </Field>
        <Field label={t.fields.password} htmlFor={`${idPrefix}-password`}>
          <Input id={`${idPrefix}-password`} name="password" type="password" autoComplete="new-password" required />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.fields.firstName} htmlFor={`${idPrefix}-first-name`} optional>
          <Input id={`${idPrefix}-first-name`} name="first_name" />
        </Field>
        <Field label={t.fields.lastName} htmlFor={`${idPrefix}-last-name`} optional>
          <Input id={`${idPrefix}-last-name`} name="last_name" />
        </Field>
      </div>
      <Field label={t.fields.phone} htmlFor={`${idPrefix}-phone`} optional>
        <Input id={`${idPrefix}-phone`} name="phone" type="tel" />
      </Field>
    </>
  )
}

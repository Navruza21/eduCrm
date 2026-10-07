import { useMutation } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { authApi } from '@/api/auth'
import type { RegisterRequest } from '@/api/types'
import { Field, FormError, LookupSelect } from '@/components/form'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { STAFF_ROLES, type StaffRole } from '@/config/roles'
import { hasBranches, useBranchLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { field, optionalField } from '@/lib/form'
import { UserFields } from './user-fields'

/** POST /auth/register/ — a director adds manager / sales / accountant to their center. */
export function StaffRegisterCard() {
  const t = useT()
  const branches = useBranchLookup()

  const mutation = useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.settings.addStaff}</CardTitle>
        <CardDescription>{t.settings.staffHint}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex max-w-xl flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            const form = event.currentTarget
            const data = new FormData(form)
            mutation.mutate(
              {
                username: field(data, 'username'),
                password: String(data.get('password') ?? ''),
                role: field(data, 'role') as StaffRole,
                branch: optionalField(data, 'branch'),
                first_name: optionalField(data, 'first_name'),
                last_name: optionalField(data, 'last_name'),
                phone: optionalField(data, 'phone'),
              },
              { onSuccess: () => form.reset() },
            )
          }}
        >
          <UserFields idPrefix="staff" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.fields.role} htmlFor="staff-role">
              <NativeSelect id="staff-role" name="role" defaultValue="manager" className="w-full">
                {STAFF_ROLES.map((role) => (
                  <NativeSelectOption key={role} value={role}>
                    {t.roles[role]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            {hasBranches(branches) && (
              <Field label={t.fields.branch} htmlFor="staff-branch" hint={t.settings.staffBranchHint} optional>
                <LookupSelect id="staff-branch" name="branch" lookup={branches} />
              </Field>
            )}
          </div>

          <FormError
            error={mutation.error}
            labels={{
              username: t.fields.username,
              password: t.fields.password,
              role: t.fields.role,
              branch: t.fields.branch,
              first_name: t.fields.firstName,
              last_name: t.fields.lastName,
              phone: t.fields.phone,
            }}
          />
          {mutation.isSuccess && (
            <Alert>
              <CircleCheck />
              <AlertTitle>{t.settings.staffCreated(mutation.data.username)}</AlertTitle>
            </Alert>
          )}
          <Button type="submit" disabled={mutation.isPending} className="self-start">
            {mutation.isPending ? t.common.saving : t.settings.register}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

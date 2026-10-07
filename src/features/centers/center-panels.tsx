import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { centersApi } from '@/api/centers'
import type { Center, CenterCreate, RegisterRequest } from '@/api/types'
import { FormPanel } from '@/components/panel'
import { ContactFields } from '@/features/settings/settings-panels'
import { UserFields } from '@/features/settings/user-fields'
import { useInvalidate } from '@/hooks/use-invalidate'
import { useT } from '@/i18n'
import { field, optionalField } from '@/lib/form'

/** POST /centers/ — the first branch is created by the server automatically. */
export function CenterCreatePanel({ onClose }: { onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()

  const mutation = useMutation({
    mutationFn: (body: CenterCreate) => centersApi.create(body),
    onSuccess: () => {
      invalidate('centers')
      onClose()
    },
  })

  return (
    <FormPanel
      title={t.centers.add}
      description={t.centers.addHint}
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
          phone: optionalField(data, 'phone'),
          address: optionalField(data, 'address'),
          contact_person: optionalField(data, 'contact_person'),
        })
      }
    >
      <ContactFields idPrefix="new-center" values={null} />
    </FormPanel>
  )
}

/** POST /auth/register/ with `role: "director"` for the given center. */
export function DirectorPanel({
  center,
  onClose,
  onCreated,
}: {
  center: Center
  onClose: () => void
  onCreated: (username: string) => void
}) {
  const t = useT()

  const mutation = useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: (user) => {
      onCreated(user.username)
      onClose()
    },
  })

  return (
    <FormPanel
      title={t.centers.directorTitle(center.name)}
      onClose={onClose}
      mutation={mutation}
      submitLabel={t.settings.register}
      errorLabels={{
        username: t.fields.username,
        password: t.fields.password,
        center: t.fields.name,
        first_name: t.fields.firstName,
        last_name: t.fields.lastName,
        phone: t.fields.phone,
      }}
      onSubmit={(data) =>
        mutation.mutate({
          username: field(data, 'username'),
          password: String(data.get('password') ?? ''),
          role: 'director',
          center: center.id,
          first_name: optionalField(data, 'first_name'),
          last_name: optionalField(data, 'last_name'),
          phone: optionalField(data, 'phone'),
        })
      }
    >
      <UserFields idPrefix="director" />
    </FormPanel>
  )
}

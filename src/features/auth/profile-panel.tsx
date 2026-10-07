import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, authQueries } from '@/api/auth'
import type { UserUpdate } from '@/api/types'
import { Field } from '@/components/form'
import { FormPanel } from '@/components/panel'
import { Input } from '@/components/ui/input'
import { useT } from '@/i18n'
import { field } from '@/lib/form'
import { useAuthStore } from '@/stores/auth-store'
import { useSession } from './hooks'

/** GET/PATCH /auth/me/ — the user's own name and phone. */
export function ProfilePanel({ onClose }: { onClose: () => void }) {
  const t = useT()
  const { user } = useSession()
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: UserUpdate) => authApi.updateMe(body),
    onSuccess: (updated) => {
      setUser(updated)
      queryClient.setQueryData(authQueries.me().queryKey, updated)
      onClose()
    },
  })

  return (
    <FormPanel
      title={t.nav.profile}
      description={t.profile.description}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{ first_name: t.fields.firstName, last_name: t.fields.lastName, phone: t.fields.phone }}
      onSubmit={(data) =>
        mutation.mutate({
          first_name: field(data, 'first_name'),
          last_name: field(data, 'last_name'),
          phone: field(data, 'phone'),
        })
      }
    >
      <Field label={t.fields.username} htmlFor="profile-username">
        <Input id="profile-username" value={user.username} disabled />
      </Field>
      <Field label={t.fields.role} htmlFor="profile-role">
        <Input id="profile-role" value={t.roles[user.role]} disabled />
      </Field>
      <Field label={t.fields.firstName} htmlFor="profile-first-name">
        <Input id="profile-first-name" name="first_name" defaultValue={user.first_name} autoComplete="given-name" />
      </Field>
      <Field label={t.fields.lastName} htmlFor="profile-last-name">
        <Input id="profile-last-name" name="last_name" defaultValue={user.last_name} autoComplete="family-name" />
      </Field>
      <Field label={t.fields.phone} htmlFor="profile-phone">
        <Input id="profile-phone" name="phone" type="tel" defaultValue={user.phone} autoComplete="tel" />
      </Field>
    </FormPanel>
  )
}

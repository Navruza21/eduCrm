import { useSession } from '@/features/auth/hooks'
import { useT } from '@/i18n'

/** Greets the user by name and says what their role can do. */
export function DashboardGreeting() {
  const t = useT()
  const { user } = useSession()

  return (
    <div className="flex flex-col gap-1">
      <p className="text-2xl font-semibold tracking-tight">{t.dashboard.welcome(user.first_name || user.username)}</p>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{t.roles[user.role]}</span>
        {' · '}
        {t.roleDescriptions[user.role]}
      </p>
    </div>
  )
}

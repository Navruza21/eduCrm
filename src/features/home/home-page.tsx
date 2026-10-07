import { Info } from 'lucide-react'
import { Link } from 'react-router'
import { AccessBadge } from '@/components/access-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MODULE_META, type ModuleId } from '@/config/modules'
import { accessibleModules, getAccess } from '@/config/permissions'
import type { Role } from '@/config/roles'
import { useSession } from '@/features/auth/hooks'
import { useT } from '@/i18n'

export function HomePage() {
  const t = useT()
  const { user } = useSession()
  const modules = accessibleModules(user.role)

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t.home.welcome(user.first_name || user.username)}</h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{t.roles[user.role]}</span>
          {' · '}
          {t.roleDescriptions[user.role]}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t.home.yourAccess}</h2>
          <p className="text-sm text-muted-foreground">{t.home.yourAccessHint}</p>
        </div>
        {modules.length === 0 ? (
          <Alert>
            <Info />
            <AlertDescription>{t.home.noModules}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard key={module} module={module} role={user.role} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function ModuleCard({ module, role }: { module: ModuleId; role: Role }) {
  const t = useT()
  const access = getAccess(role, module)
  const { icon: Icon, path } = MODULE_META[module]

  return (
    <Link
      to={path}
      className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Card className="h-full transition-colors group-hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            {t.modules[module]}
          </CardTitle>
          <CardDescription>{t.moduleDescriptions[module]}</CardDescription>
          <CardAction>
            <AccessBadge access={access} />
          </CardAction>
        </CardHeader>
      </Card>
    </Link>
  )
}

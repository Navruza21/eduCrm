import { Store } from 'lucide-react'
import type { ReactNode } from 'react'
import { AccessBadge } from '@/components/access-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ModuleId } from '@/config/modules'
import { useAccess, useSession } from '@/features/auth/hooks'
import { useT } from '@/i18n'

export function PageHeader({ module, actions }: { module: ModuleId; actions?: ReactNode }) {
  const t = useT()
  const { user } = useSession()
  const access = useAccess(module)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{t.modules[module]}</h1>
            <AccessBadge access={access} />
          </div>
          <p className="text-sm text-muted-foreground">{t.moduleDescriptions[module]}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {user.branch && module !== 'centers' && (
        <Alert>
          <Store />
          <AlertDescription>{t.access.branchScope}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

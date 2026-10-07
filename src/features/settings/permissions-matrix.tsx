import { AccessBadge } from '@/components/access-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MODULES } from '@/config/modules'
import { ACCESS_ICONS, PERMISSIONS, type Access } from '@/config/permissions'
import { ROLES } from '@/config/roles'
import { useT } from '@/i18n'
import { cn } from '@/lib/utils'

export function PermissionsMatrix() {
  const t = useT()

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">{t.settings.matrixHint}</p>
      <div className="flex flex-wrap gap-2">
        {(['full', 'view', 'none'] as const).map((access) => (
          <AccessBadge key={access} access={access} />
        ))}
      </div>
      <div className="rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.settings.module}</TableHead>
              {ROLES.map((role) => (
                <TableHead key={role} className="text-center">
                  {t.roles[role]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {MODULES.map((module) => (
              <TableRow key={module}>
                <TableCell className="font-medium">{t.modules[module]}</TableCell>
                {ROLES.map((role) => (
                  <TableCell key={role} className="text-center">
                    <MatrixCell access={PERMISSIONS[module][role]} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

function MatrixCell({ access }: { access: Access }) {
  const t = useT()
  const Icon = ACCESS_ICONS[access]

  return (
    <Icon
      role="img"
      aria-label={t.access[access]}
      className={cn('mx-auto size-4', access === 'none' ? 'text-muted-foreground/60' : 'text-foreground')}
    >
      <title>{t.access[access]}</title>
    </Icon>
  )
}

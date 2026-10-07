import { Badge } from '@/components/ui/badge'
import { ACCESS_ICONS, type Access } from '@/config/permissions'
import { useT } from '@/i18n'

const VARIANTS = { full: 'default', view: 'secondary', none: 'outline' } as const

export function AccessBadge({ access }: { access: Access }) {
  const t = useT()
  const Icon = ACCESS_ICONS[access]

  return (
    <Badge variant={VARIANTS[access]}>
      <Icon data-icon="inline-start" />
      {t.access[access]}
    </Badge>
  )
}

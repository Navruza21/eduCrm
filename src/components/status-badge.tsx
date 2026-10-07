import type { GroupStatus, InvoiceStatus, StudentStatus } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/i18n'

const STUDENT_VARIANTS = { active: 'secondary', paused: 'outline', stopped: 'destructive', left: 'ghost' } as const
const GROUP_VARIANTS = { open: 'secondary', full: 'default', finished: 'outline', archived: 'ghost' } as const
const INVOICE_VARIANTS = { pending: 'outline', partial: 'secondary', paid: 'default', cancelled: 'ghost' } as const

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const t = useT()
  return <Badge variant={STUDENT_VARIANTS[status]}>{t.students.statuses[status]}</Badge>
}

export function GroupStatusBadge({ status }: { status: GroupStatus }) {
  const t = useT()
  return <Badge variant={GROUP_VARIANTS[status]}>{t.groups.statuses[status]}</Badge>
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const t = useT()
  return <Badge variant={INVOICE_VARIANTS[status]}>{t.finance.statuses[status]}</Badge>
}

export function ActiveBadge({ active }: { active: boolean }) {
  const t = useT()
  return <Badge variant={active ? 'secondary' : 'ghost'}>{active ? t.fields.active : t.fields.inactive}</Badge>
}

import { Lock, SearchX, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n'

function StatusPage({
  icon: Icon,
  title,
  text,
  backLink = true,
}: {
  icon: LucideIcon
  title: string
  text: string
  backLink?: boolean
}) {
  const t = useT()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{text}</p>
      {backLink && (
        <Button asChild variant="outline">
          <Link to="/">{t.errors.backHome}</Link>
        </Button>
      )}
    </div>
  )
}

export function ForbiddenPage() {
  const t = useT()
  return <StatusPage icon={Lock} title={t.errors.forbiddenTitle} text={t.errors.forbiddenText} />
}

/** `/` for a role with no open modules (sales, until the leads module ships) — nowhere to go back to. */
export function NoModulesPage() {
  const t = useT()
  return <StatusPage icon={Lock} title={t.errors.forbiddenTitle} text={t.errors.noModules} backLink={false} />
}

export function NotFoundPage() {
  const t = useT()
  return <StatusPage icon={SearchX} title={t.errors.notFoundTitle} text={t.errors.notFoundText} />
}

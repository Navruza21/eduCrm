import type { UseQueryResult } from '@tanstack/react-query'
import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertAction, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useErrorText } from '@/hooks/use-error-text'
import { useT } from '@/i18n'

/** Loading and error states shared by every page; renders children once data is there. */
export function QueryView<T>({
  query,
  skeleton = 'page',
  children,
}: {
  query: UseQueryResult<T>
  /** `list` — just a table placeholder, for panels and secondary sections. */
  skeleton?: 'page' | 'list'
  children: (data: T) => ReactNode
}) {
  const t = useT()
  const errorText = useErrorText()

  if (query.isPending) {
    if (skeleton === 'list') return <Skeleton className="h-40" />
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>{errorText(query.error)}</AlertTitle>
        <AlertAction>
          <Button size="sm" variant="outline" onClick={() => query.refetch()}>
            {t.common.retry}
          </Button>
        </AlertAction>
      </Alert>
    )
  }

  return children(query.data)
}

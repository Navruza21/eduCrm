import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Label / value pairs of one record: a center profile, an invoice summary. */
export function DetailList({
  items,
  className,
}: {
  items: { label: string; value: ReactNode }[]
  className?: string
}) {
  return (
    <dl className={cn('grid gap-4 text-sm', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="font-medium break-words tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

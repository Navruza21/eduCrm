import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n'

/** Footer for a paginated list: `{count, next, previous}` from the API. */
export function Pagination({
  page,
  pageSize,
  count,
  onPageChange,
}: {
  page: number
  pageSize: number
  count: number
  onPageChange: (page: number) => void
}) {
  const t = useT()
  const pages = Math.ceil(count / pageSize)
  if (pages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, count)

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground tabular-nums">{t.common.pageInfo(from, to, count)}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft data-icon="inline-start" />
          {t.common.prev}
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          {t.common.next}
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}

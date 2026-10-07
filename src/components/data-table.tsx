import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useT } from '@/i18n'

export type Column<T> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  /** Drops the column entirely — for fields the role is not allowed to see. */
  hidden?: boolean
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: Column<T>[]
  rows: T[]
}) {
  const t = useT()
  const visible = columns.filter((column) => !column.hidden)

  return (
    <div className="rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            {visible.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visible.length} className="h-24 text-center text-muted-foreground">
                {t.common.empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {visible.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

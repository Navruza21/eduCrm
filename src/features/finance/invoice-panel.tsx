import { useMutation, useQuery } from '@tanstack/react-query'
import { Ban } from 'lucide-react'
import { invoiceQueries, invoicesApi } from '@/api/payments'
import { PAYMENT_METHODS, type Invoice, type PaymentCreate, type PaymentMethod } from '@/api/types'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DetailList } from '@/components/detail-list'
import { Field, FormError } from '@/components/form'
import { Panel } from '@/components/panel'
import { QueryView } from '@/components/query-view'
import { InvoiceStatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useCanEdit } from '@/features/auth/hooks'
import { useInvalidate } from '@/hooks/use-invalidate'
import { useGroupLookup, useStudentLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { field, optionalField } from '@/lib/form'

/** An invoice with its payments: GET/POST /invoices/<id>/payments/, POST /invoices/<id>/cancel/. */
export function InvoicePanel({ invoice: initial, onClose }: { invoice: Invoice; onClose: () => void }) {
  const t = useT()
  const f = useFormat()
  const canEdit = useCanEdit('finance')
  const students = useStudentLookup()
  const groups = useGroupLookup()
  const invalidate = useInvalidate()

  // The row from the list is the first snapshot; after a payment the server recomputes the totals.
  const { data: invoice = initial } = useQuery({ ...invoiceQueries.detail(initial.id), initialData: initial })
  const payments = useQuery(invoiceQueries.payments(invoice.id))

  const addPayment = useMutation({
    mutationFn: (body: PaymentCreate) => invoicesApi.addPayment(invoice.id, body),
    // Payments move the invoice status, the debt and the teachers' monthly revenue.
    onSuccess: () => invalidate('invoices', 'dashboard', 'teachers'),
  })
  const cancel = useMutation({
    mutationFn: () => invoicesApi.cancel(invoice.id),
    onSuccess: () => invalidate('invoices', 'dashboard'),
  })

  const acceptsPayments = canEdit && invoice.status !== 'cancelled' && invoice.status !== 'paid'

  return (
    <Panel title={t.finance.invoiceTitle(f.month(invoice.period_label))} onClose={onClose}>
      <DetailList
        className="grid-cols-2 gap-x-4 gap-y-3"
        items={[
          { label: t.finance.student, value: students.label(invoice.student) },
          { label: t.finance.group, value: groups.label(invoice.group) },
          { label: t.finance.amount, value: f.money(invoice.amount) },
          { label: t.finance.paid, value: f.money(invoice.total_paid) },
          { label: t.finance.outstanding, value: f.money(invoice.outstanding_amount) },
          {
            label: t.finance.dueDate,
            value: (
              <span className="flex flex-wrap items-center gap-2">
                {f.date(invoice.due_date)}
                {invoice.is_overdue && <Badge variant="destructive">{t.finance.overdue}</Badge>}
              </span>
            ),
          },
          { label: t.fields.status, value: <InvoiceStatusBadge status={invoice.status} /> },
        ]}
      />

      {acceptsPayments && (
        <form
          // Remount after each payment so the amount defaults to the new outstanding sum.
          key={invoice.total_paid}
          className="flex flex-col gap-3 rounded-lg border p-3"
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            addPayment.mutate({
              amount: field(data, 'amount'),
              method: field(data, 'method') as PaymentMethod,
              note: optionalField(data, 'note'),
            })
          }}
        >
          <h3 className="font-medium">{t.finance.addPayment}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.finance.amount} htmlFor="payment-amount">
              <Input
                id="payment-amount"
                name="amount"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                defaultValue={Number(invoice.outstanding_amount)}
                required
              />
            </Field>
            <Field label={t.finance.method} htmlFor="payment-method">
              <NativeSelect id="payment-method" name="method" defaultValue="cash" className="w-full">
                {PAYMENT_METHODS.map((method) => (
                  <NativeSelectOption key={method} value={method}>
                    {t.finance.methods[method]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field label={t.finance.note} htmlFor="payment-note" optional>
            <Input id="payment-note" name="note" />
          </Field>
          <FormError
            error={addPayment.error}
            labels={{ amount: t.finance.amount, method: t.finance.method, note: t.finance.note }}
          />
          <Button type="submit" disabled={addPayment.isPending} className="self-start">
            {addPayment.isPending ? t.common.saving : t.finance.addPayment}
          </Button>
        </form>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">{t.finance.payments}</h3>
        <QueryView query={payments} skeleton="list">
          {(rows) =>
            rows.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">{t.finance.noPayments}</p>
            ) : (
              <ul className="flex flex-col divide-y rounded-lg border">
                {rows.map((payment) => (
                  <li key={payment.id} className="flex items-start justify-between gap-3 p-3 text-sm">
                    <div className="grid min-w-0 gap-0.5">
                      <span className="font-medium tabular-nums">{f.money(payment.amount)}</span>
                      <span className="text-xs text-muted-foreground">
                        {f.dateTime(payment.paid_at)} · {t.finance.recordedBy}: {payment.recorded_by}
                      </span>
                      {payment.note && <span className="text-xs text-muted-foreground">{payment.note}</span>}
                    </div>
                    <Badge variant="outline">{t.finance.methods[payment.method]}</Badge>
                  </li>
                ))}
              </ul>
            )
          }
        </QueryView>
      </section>

      {canEdit && invoice.status !== 'cancelled' && (
        <div className="flex flex-col gap-2 border-t pt-4">
          <FormError error={cancel.error} />
          <ConfirmDialog
            trigger={
              <Button variant="destructive" className="self-start" disabled={cancel.isPending}>
                <Ban data-icon="inline-start" />
                {t.finance.cancelInvoice}
              </Button>
            }
            title={t.finance.cancelTitle}
            description={t.finance.cancelText}
            confirmLabel={t.finance.cancelInvoice}
            cancelLabel={t.finance.keep}
            onConfirm={() => cancel.mutate()}
          />
        </div>
      )}
    </Panel>
  )
}

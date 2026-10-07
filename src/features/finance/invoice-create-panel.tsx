import { useMutation } from '@tanstack/react-query'
import { invoicesApi } from '@/api/payments'
import type { InvoiceCreate } from '@/api/types'
import { Field, LookupSelect } from '@/components/form'
import { FormPanel } from '@/components/panel'
import { Input } from '@/components/ui/input'
import { useInvalidate } from '@/hooks/use-invalidate'
import { hasBranches, useBranchLookup, useGroupLookup, useStudentLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { currentMonth, field, optionalField } from '@/lib/form'

export function InvoiceCreatePanel({ onClose }: { onClose: () => void }) {
  const t = useT()
  const invalidate = useInvalidate()
  const students = useStudentLookup()
  const groups = useGroupLookup()
  const branches = useBranchLookup()

  const mutation = useMutation({
    mutationFn: (body: InvoiceCreate) => invoicesApi.create(body),
    onSuccess: () => {
      invalidate('invoices', 'dashboard')
      onClose()
    },
  })

  return (
    <FormPanel
      title={t.finance.addInvoice}
      onClose={onClose}
      mutation={mutation}
      errorLabels={{
        student: t.finance.student,
        group: t.finance.group,
        amount: t.finance.amount,
        period_label: t.finance.period,
        due_date: t.finance.dueDate,
        branch: t.fields.branch,
      }}
      onSubmit={(data) =>
        mutation.mutate({
          student: field(data, 'student'),
          group: optionalField(data, 'group'),
          amount: optionalField(data, 'amount'),
          period_label: field(data, 'period_label'),
          due_date: field(data, 'due_date'),
          branch: optionalField(data, 'branch'),
        })
      }
    >
      <Field
        label={t.finance.student}
        htmlFor="invoice-student"
        hint={students.available ? undefined : t.finance.idHint}
      >
        <LookupSelect id="invoice-student" name="student" lookup={students} required />
      </Field>
      <Field
        label={t.finance.group}
        htmlFor="invoice-group"
        hint={groups.available ? undefined : t.finance.idHint}
        optional
      >
        <LookupSelect id="invoice-group" name="group" lookup={groups} />
      </Field>
      <Field label={t.finance.amount} htmlFor="invoice-amount" hint={t.finance.amountHint} optional>
        <Input id="invoice-amount" name="amount" type="number" inputMode="decimal" min={0} step="any" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.finance.period} htmlFor="invoice-period">
          <Input id="invoice-period" name="period_label" type="month" defaultValue={currentMonth()} required />
        </Field>
        <Field label={t.finance.dueDate} htmlFor="invoice-due-date">
          <Input id="invoice-due-date" name="due_date" type="date" required />
        </Field>
      </div>
      {hasBranches(branches) && (
        <Field label={t.fields.branch} htmlFor="invoice-branch" optional>
          <LookupSelect id="invoice-branch" name="branch" lookup={branches} />
        </Field>
      )}
    </FormPanel>
  )
}

import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { errorDetails } from '@/api/errors'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useErrorText } from '@/hooks/use-error-text'
import type { Lookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'

export function Field({
  label,
  htmlFor,
  hint,
  optional,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  optional?: boolean
  children: ReactNode
}) {
  const t = useT()

  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>
        {label}
        {optional && <span className="font-normal text-muted-foreground">({t.common.optional})</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Keys DRF uses for errors that don't belong to one field. */
const GENERAL_KEYS = new Set(['non_field_errors', 'detail'])

/** The server's message plus per-field validation details, with fields named as in the form. */
export function FormError({ error, labels }: { error: Error | null; labels?: Record<string, string> }) {
  const t = useT()
  const errorText = useErrorText()
  if (!error) return null

  const details = errorDetails(error)

  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>{errorText(error, t.errors.saveFailed)}</AlertTitle>
      {details.length > 0 && (
        <AlertDescription>
          <ul className="flex flex-col gap-0.5">
            {details.map(([key, message]) => {
              const label = labels?.[key] ?? (GENERAL_KEYS.has(key) ? null : key)
              return <li key={key}>{label ? `${label}: ${message}` : message}</li>
            })}
          </ul>
        </AlertDescription>
      )}
    </Alert>
  )
}

/**
 * A select over a lookup. When the role can't list the entity, falls back to a
 * plain id input — the request still works, the user just has to know the id.
 */
export function LookupSelect({
  id,
  name,
  lookup,
  defaultValue,
  required,
  exclude,
}: {
  id: string
  name: string
  lookup: Lookup
  defaultValue?: string | null
  required?: boolean
  /** Ids to leave out, e.g. students already in the group. */
  exclude?: Set<string>
}) {
  const t = useT()

  if (!lookup.available) {
    return (
      <Input id={id} name={name} defaultValue={defaultValue ?? ''} required={required} className="font-mono" />
    )
  }

  return (
    // Remount once the options arrive, so defaultValue can select one of them.
    <NativeSelect
      key={lookup.options.length}
      id={id}
      name={name}
      defaultValue={defaultValue ?? ''}
      required={required}
      className="w-full"
    >
      <NativeSelectOption value="">{t.common.notSelected}</NativeSelectOption>
      {lookup.options
        .filter((option) => !exclude?.has(option.id))
        .map((option) => (
          <NativeSelectOption key={option.id} value={option.id}>
            {option.label}
          </NativeSelectOption>
        ))}
    </NativeSelect>
  )
}

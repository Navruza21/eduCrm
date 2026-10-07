import type { ReactNode } from 'react'
import { FormError } from '@/components/form'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useT } from '@/i18n'

// Panels are mounted only while open (`{editing && <EditPanel …/>}`), so every
// opening starts with a fresh form and a fresh mutation state.

type PanelProps = {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

/** Radix links the description itself; without one it wants an explicit "none". */
const describedBy = (description?: string) => (description ? {} : { 'aria-describedby': undefined })

function PanelHeader({ title, description }: Pick<PanelProps, 'title' | 'description'>) {
  return (
    <SheetHeader className="pr-12">
      <SheetTitle>{title}</SheetTitle>
      {description && <SheetDescription>{description}</SheetDescription>}
    </SheetHeader>
  )
}

/** A side panel with read-only content: group members, invoice payments. */
export function Panel({ title, description, onClose, children }: PanelProps) {
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
        {...describedBy(description)}
      >
        <PanelHeader title={title} description={description} />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

/** A side panel with a form: create / edit. Reads the inputs with FormData on submit. */
export function FormPanel({
  title,
  description,
  onClose,
  onSubmit,
  mutation,
  submitLabel,
  errorLabels,
  children,
}: PanelProps & {
  onSubmit: (data: FormData) => void
  mutation: { isPending: boolean; error: Error | null }
  submitLabel?: string
  /** API field name → form label, to name fields in validation errors. */
  errorLabels?: Record<string, string>
}) {
  const t = useT()

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        {...describedBy(description)}
      >
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(new FormData(event.currentTarget))
          }}
        >
          <PanelHeader title={title} description={description} />
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            {children}
            <FormError error={mutation.error} labels={errorLabels} />
          </div>
          <SheetFooter className="border-t sm:flex-row-reverse sm:justify-start">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t.common.saving : (submitLabel ?? t.common.save)}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              {t.common.cancel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

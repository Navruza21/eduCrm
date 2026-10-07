import { cn } from '@/lib/utils'

/** The brand mark (public/logo.png) on a white tile — the photo has a white background. */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Edu CRM"
      className={cn('aspect-square shrink-0 rounded-lg bg-white object-contain ring-1 ring-black/5', className)}
    />
  )
}

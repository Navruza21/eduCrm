import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect, type ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useLocale } from '@/i18n'
import { queryClient } from '@/lib/query-client'

export function Providers({ children }: { children: ReactNode }) {
  const locale = useLocale()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>{children}</TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

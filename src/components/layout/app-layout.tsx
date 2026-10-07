import { Outlet } from 'react-router'
import { LanguageSwitcher } from '@/components/language-switcher'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useCenterName, useSession } from '@/features/auth/hooks'
import { useT } from '@/i18n'

export function AppLayout() {
  const t = useT()
  const { user } = useSession()
  const centerName = useCenterName()

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* min-w-0: wide tables scroll inside their own box instead of stretching the page. */}
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          {centerName && <span className="truncate text-sm font-medium">{centerName}</span>}
          <Badge variant="secondary">{t.roles[user.role]}</Badge>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </header>
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

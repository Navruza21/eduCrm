import { ChevronsUpDown, House, LogOut, School, UserRound } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { MODULE_META } from '@/config/modules'
import { accessibleModules } from '@/config/permissions'
import { displayName, useCenterName, useLogout, useSession } from '@/features/auth/hooks'
import { ProfilePanel } from '@/features/auth/profile-panel'
import { useT } from '@/i18n'
import { initials } from '@/lib/utils'

export function AppSidebar() {
  const t = useT()
  const { user } = useSession()
  const centerName = useCenterName()
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()
  const logout = useLogout()
  const [profileOpen, setProfileOpen] = useState(false)
  const name = displayName(user)

  // The menu is built from the permission matrix: closed modules never show up.
  const items = [
    { id: 'home', label: t.nav.home, path: '/', icon: House },
    ...accessibleModules(user.role).map((module) => ({
      id: module,
      label: t.modules[module],
      ...MODULE_META[module],
    })),
  ]

  const isActive = (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path))

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <NavLink to="/" onClick={() => setOpenMobile(false)}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <School className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Edu CRM</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {centerName ?? t.roles[user.role]}
                    </span>
                  </div>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
  
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t.nav.menu}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                      <NavLink to={item.path} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
  
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">{initials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{name}</span>
                      <span className="truncate text-xs text-muted-foreground">{t.roles[user.role]}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side={isMobile ? 'bottom' : 'right'} align="end" className="min-w-56">
                  <DropdownMenuLabel className="flex flex-col font-normal">
                    <span className="font-medium text-foreground">{name}</span>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setOpenMobile(false)
                      setProfileOpen(true)
                    }}
                  >
                    <UserRound />
                    {t.nav.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={logout}>
                    <LogOut />
                    {t.common.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
    </>
  )
}

import {
  Building2,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Store,
  UserRoundCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export const MODULES = [
  'dashboard',
  'students',
  'groups',
  'teachers',
  'finance',
  'feedback',
  'branches',
  'settings',
  'centers',
] as const

export type ModuleId = (typeof MODULES)[number]

export const MODULE_META: Record<ModuleId, { path: string; icon: LucideIcon }> = {
  dashboard: { path: '/dashboard', icon: LayoutDashboard },
  students: { path: '/students', icon: GraduationCap },
  groups: { path: '/groups', icon: CalendarDays },
  teachers: { path: '/teachers', icon: UserRoundCheck },
  finance: { path: '/finance', icon: Wallet },
  feedback: { path: '/feedback', icon: MessageSquareText },
  branches: { path: '/branches', icon: Store },
  settings: { path: '/settings', icon: Settings },
  centers: { path: '/centers', icon: Building2 },
}

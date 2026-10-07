import { Ban, CircleCheck, Eye } from 'lucide-react'
import { MODULE_META, MODULES, type ModuleId } from './modules'
import type { Role } from './roles'

/** full — read and write · view — read only · none — closed. */
export type Access = 'full' | 'view' | 'none'

/**
 * Mirrors the backend permission codes (API docs, sections 1–9). The server is
 * the source of truth — this only hides what a role can't open anyway.
 */
export const PERMISSIONS: Record<ModuleId, Record<Role, Access>> = {
  // report.view
  dashboard: { super_admin: 'none', director: 'full', manager: 'full', sales: 'none', accountant: 'full' },
  // student.manage_own
  students: { super_admin: 'none', director: 'full', manager: 'full', sales: 'none', accountant: 'none' },
  // group.manage_own
  groups: { super_admin: 'none', director: 'full', manager: 'full', sales: 'none', accountant: 'none' },
  // teacher.manage_own / teacher.view_own
  teachers: { super_admin: 'none', director: 'full', manager: 'view', sales: 'none', accountant: 'view' },
  // finance.manage_own / finance.view_own
  finance: { super_admin: 'none', director: 'full', manager: 'view', sales: 'none', accountant: 'full' },
  // feedback.manage_own
  feedback: { super_admin: 'none', director: 'full', manager: 'full', sales: 'none', accountant: 'none' },
  // center.manage_own — center profile, branches, courses, staff registration
  settings: { super_admin: 'none', director: 'full', manager: 'none', sales: 'none', accountant: 'none' },
  // super_admin only — onboarding of new centers
  centers: { super_admin: 'full', director: 'none', manager: 'none', sales: 'none', accountant: 'none' },
}

export function getAccess(role: Role, module: ModuleId): Access {
  return PERMISSIONS[module][role]
}

export function canAccess(role: Role, module: ModuleId): boolean {
  return getAccess(role, module) !== 'none'
}

export function canEdit(role: Role, module: ModuleId): boolean {
  return getAccess(role, module) === 'full'
}

export function accessibleModules(role: Role): ModuleId[] {
  return MODULES.filter((module) => canAccess(role, module))
}

/** Where `/` leads: the role's first open module — the dashboard for most roles. */
export function homePath(role: Role): string | undefined {
  const module = accessibleModules(role)[0]
  return module && MODULE_META[module].path
}

export const ACCESS_ICONS = { full: CircleCheck, view: Eye, none: Ban }

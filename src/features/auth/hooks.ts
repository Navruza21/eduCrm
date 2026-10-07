import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { centerQueries } from '@/api/centers'
import type { User } from '@/api/types'
import type { ModuleId } from '@/config/modules'
import { canAccess, canEdit, getAccess, type Access } from '@/config/permissions'
import { useAuthStore, type Session } from '@/stores/auth-store'

export function useSession(): Session {
  const session = useAuthStore((state) => state.session)
  if (!session) throw new Error('useSession() must be used under <RequireAuth>')
  return session
}

export function useAccess(module: ModuleId): Access {
  return getAccess(useSession().user.role, module)
}

export function useCanAccess(module: ModuleId): boolean {
  return canAccess(useSession().user.role, module)
}

/** Write actions (create / edit / delete buttons) — only with full access. */
export function useCanEdit(module: ModuleId): boolean {
  return canEdit(useSession().user.role, module)
}

/** "Aziz Karimov", or the login when the profile has no name yet. */
export const displayName = (user: User) =>
  [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username

/** The center's name — only the director can read /centers/me/. */
export function useCenterName(): string | undefined {
  const query = useQuery({ ...centerQueries.me(), enabled: useCanAccess('settings') })
  return query.data?.name
}

export function useLogout() {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((state) => state.clearSession)

  return () => {
    const session = useAuthStore.getState().session
    // Blacklist the refresh token; the user is logged out locally either way.
    if (session) authApi.logout({ refresh: session.refresh }).catch(() => {})
    clearSession()
    // Cached data belongs to the previous user — never show it to the next one.
    queryClient.clear()
  }
}

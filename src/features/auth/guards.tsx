import { useQuery } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { authQueries } from '@/api/auth'
import type { ModuleId } from '@/config/modules'
import { homePath } from '@/config/permissions'
import { ForbiddenPage, NoModulesPage } from '@/features/errors/status-pages'
import { useAuthStore } from '@/stores/auth-store'
import { useAccess, useSession } from './hooks'

export function RequireAuth() {
  const session = useAuthStore((state) => state.session)
  const location = useLocation()

  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <>
      <SyncUser />
      <Outlet />
    </>
  )
}

/** The stored profile may be stale (role or branch changed) — re-read /me/ once per visit. */
function SyncUser() {
  const setUser = useAuthStore((state) => state.setUser)
  const { data } = useQuery({ ...authQueries.me(), staleTime: Infinity })

  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])

  return null
}

/** `/` has no page of its own — it opens the role's first module. */
export function HomeRedirect() {
  const path = homePath(useSession().user.role)
  return path ? <Navigate to={path} replace /> : <NoModulesPage />
}

/** Hides the page itself; the API answers 403 for the data as well. */
export function RequireModule({ module, children }: { module: ModuleId; children: ReactNode }) {
  return useAccess(module) === 'none' ? <ForbiddenPage /> : children
}

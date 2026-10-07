import { queryOptions } from '@tanstack/react-query'
import type { Session } from '@/stores/auth-store'
import { request } from './client'
import type { LoginRequest, LogoutRequest, RegisterRequest, TokenPair, User, UserUpdate } from './types'

// /auth/token/refresh/ is called by the client itself on 401 — see client.ts.
export const authApi = {
  login: (body: LoginRequest) => request<TokenPair>('/auth/login/', { method: 'POST', body, auth: false }),
  logout: (body: LogoutRequest) => request<void>('/auth/logout/', { method: 'POST', body }),
  me: (token?: string) => request<User>('/auth/me/', { token }),
  updateMe: (body: UserUpdate) => request<User>('/auth/me/', { method: 'PATCH', body }),
  /** super_admin → director of any center; director → manager / sales / accountant. */
  register: (body: RegisterRequest) => request<User>('/auth/register/', { method: 'POST', body }),
}

/** Login returns only tokens; the role comes from /me/ and is needed before any page renders. */
export async function signIn(credentials: LoginRequest): Promise<Session> {
  const tokens = await authApi.login(credentials)
  const user = await authApi.me(tokens.access)
  return { ...tokens, user }
}

export const authQueries = {
  me: () => queryOptions({ queryKey: ['auth', 'me'], queryFn: () => authApi.me() }),
}

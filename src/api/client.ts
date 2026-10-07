import { useLocaleStore } from '@/i18n'
import { useAuthStore } from '@/stores/auth-store'
import { ApiError, isApiError } from './errors'
import type { ApiErrorBody, PageParams, Paginated, TokenRefreshResponse } from './types'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

/**
 * In dev only the path is kept (`https://host/crm/api/v1` → `/crm/api/v1`): the browser calls
 * the dev server and Vite forwards it to the backend host — the backend has no CORS for localhost.
 */
export const API_URL = (import.meta.env.DEV ? BASE_URL.replace(/^https?:\/\/[^/]+/, '') : BASE_URL).replace(
  /\/+$/,
  '',
)

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

type QueryValue = string | number | boolean | null | undefined

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, QueryValue>
  /** `false` — public endpoint, no Authorization header. */
  auth?: boolean
  /** Explicit access token (right after login, before the session is stored); never refreshed. */
  token?: string
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, token } = options
  const sessionToken = auth && !token ? useAuthStore.getState().session?.access : undefined

  let response = await send(path, options, token ?? sessionToken)

  // The access token lives ~minutes: refresh it once and repeat the request.
  if (response.status === 401 && sessionToken) {
    // A parallel request may have refreshed it already — reuse that token instead of
    // spending the refresh token twice (with rotation the second refresh would fail).
    const current = useAuthStore.getState().session?.access
    const access = current && current !== sessionToken ? current : await refreshAccessToken()
    if (access) response = await send(path, options, access)
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

function send(path: string, { method = 'GET', body, query }: RequestOptions, token?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': useLocaleStore.getState().locale,
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  return fetch(API_URL + path + queryString(query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

function queryString(query: RequestOptions['query']): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `?${search}` : ''
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as Partial<ApiErrorBody> | null
  const error = body?.error
  return new ApiError(response.status, error?.code ?? 'unknown', error?.message ?? '', error?.details)
}

let refreshing: Promise<string | null> | null = null

/** One refresh for all requests that hit 401 at the same time. */
function refreshAccessToken(): Promise<string | null> {
  refreshing ??= refreshSession().finally(() => {
    refreshing = null
  })
  return refreshing
}

async function refreshSession(): Promise<string | null> {
  const { session, setTokens, clearSession } = useAuthStore.getState()
  if (!session) return null

  try {
    const tokens = await request<TokenRefreshResponse>('/auth/token/refresh/', {
      method: 'POST',
      body: { refresh: session.refresh },
      auth: false,
    })
    setTokens(tokens.access, tokens.refresh ?? session.refresh)
    return tokens.access
  } catch (error) {
    // The refresh token is expired or revoked — the guard sends the user to /login.
    if (isApiError(error)) clearSession()
    return null
  }
}

/**
 * One page of a list endpoint. Some lists (`/feedback/`, `/payments/invoices/`) come unpaginated —
 * a plain array of every row — so the page is cut out here and tables work the same either way.
 */
export async function requestPage<T>(
  path: string,
  query: PageParams & RequestOptions['query'] = {},
): Promise<Paginated<T>> {
  const data = await request<Paginated<T> | T[]>(path, { query })
  if (!Array.isArray(data)) return data
  const { page = 1, page_size = DEFAULT_PAGE_SIZE } = query
  const results = data.slice((page - 1) * page_size, page * page_size)
  return { count: data.length, next: null, previous: null, results }
}

/** Walks every page of a list endpoint — for small catalogs used in selects and name lookups. */
export async function fetchAllPages<T>(path: string, query?: RequestOptions['query']): Promise<T[]> {
  const rows: T[] = []
  for (let page = 1; ; page++) {
    const data = await request<Paginated<T> | T[]>(path, {
      query: { ...query, page, page_size: MAX_PAGE_SIZE },
    })
    if (Array.isArray(data)) return data
    rows.push(...data.results)
    if (!data.next) return rows
  }
}

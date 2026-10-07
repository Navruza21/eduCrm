import type { ApiErrorBody } from './types'

type ErrorDetails = NonNullable<ApiErrorBody['error']['details']>

/** A non-2xx response, parsed from `{"success": false, "error": {code, message, details}}`. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: ErrorDetails | undefined

  constructor(status: number, code: string, message: string, details?: ErrorDetails) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const isApiError = (error: unknown, status?: number): error is ApiError =>
  error instanceof ApiError && (status === undefined || error.status === status)

/** Validation details → one line per field: `{phone: ["Required."]}` → `[["phone", "Required."]]`. */
export function errorDetails(error: unknown): [field: string, message: string][] {
  if (!isApiError(error) || !error.details) return []
  return Object.entries(error.details).map(([field, value]) => [field, detailText(value)])
}

function detailText(value: unknown): string {
  if (Array.isArray(value)) return value.map(detailText).join(' ')
  if (value && typeof value === 'object') return Object.values(value).map(detailText).join(' ')
  return String(value)
}

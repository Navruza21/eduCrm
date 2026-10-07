import { isApiError } from '@/api/errors'
import { useT } from '@/i18n'

/** Human text for a failed request: the server's message when it has one. */
export function useErrorText() {
  const t = useT()

  return (error: unknown, fallback: string = t.common.loadError): string => {
    if (!isApiError(error)) return t.errors.network
    // DRF's default 403 text is English — the localized one reads better.
    if (error.status === 403) return t.errors.forbiddenText
    if (error.message) return error.message
    return error.status === 400 ? t.errors.validation : fallback
  }
}

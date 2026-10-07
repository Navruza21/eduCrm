/** Trimmed value of a form field. */
export const field = (data: FormData, name: string) => String(data.get(name) ?? '').trim()

/** Empty → undefined, so an optional field is left out of the request body. */
export const optionalField = (data: FormData, name: string) => field(data, name) || undefined

/** Empty → null — clears a nullable relation on PATCH. */
export const nullableField = (data: FormData, name: string) => field(data, name) || null

/** Checkbox → boolean. */
export const checkboxField = (data: FormData, name: string) => data.get(name) === 'on'

/** Local "2026-10" for `<input type="month">` defaults. */
export function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

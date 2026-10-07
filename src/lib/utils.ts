export { cn } from "cn"

/** "Aziz Karimov" → "AK" */
export const initials = (fullName: string) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

/** First characters of a UUID — when the role can't load the name behind it. */
export const shortId = (id: string) => `#${id.slice(0, 8)}`

/** Label of an open enum value: the translation if there is one, the raw value otherwise. */
export const labelOf = (labels: Record<string, string>, value: string) => labels[value] ?? value

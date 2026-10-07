import { useMemo } from 'react'
import { INTL_LOCALES, useLocale, useT } from '.'

/** "2026-09-28" is a local calendar date — parse it without the UTC shift of `new Date(iso)`. */
const parseDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)

export function useFormat() {
  const locale = useLocale()
  const t = useT()

  return useMemo(() => {
    const tag = INTL_LOCALES[locale]
    const number = new Intl.NumberFormat(tag, { maximumFractionDigits: 2 })
    const compact = new Intl.NumberFormat(tag, { notation: 'compact', maximumFractionDigits: 1 })
    const percent = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 })
    const date = new Intl.DateTimeFormat(tag, { day: 'numeric', month: 'short', year: 'numeric' })
    const dateTime = new Intl.DateTimeFormat(tag, { dateStyle: 'medium', timeStyle: 'short' })
    const month = new Intl.DateTimeFormat(tag, { month: 'long', year: 'numeric' })

    return {
      number: (value: number) => number.format(value),
      /** Accepts API decimals as they come: "250000.00". */
      money: (value: number | string) => `${number.format(Number(value))} ${t.common.currency}`,
      moneyCompact: (value: number | string) => `${compact.format(Number(value))} ${t.common.currency}`,
      percent: (value: number) => `${percent.format(value)}%`,
      date: (iso: string) => date.format(parseDate(iso)),
      dateTime: (iso: string) => dateTime.format(parseDate(iso)),
      /** "2026-09" → "September 2026"; anything else is shown as is. */
      month: (period: string) => {
        const match = /^(\d{4})-(\d{2})$/.exec(period)
        return match ? month.format(new Date(Number(match[1]), Number(match[2]) - 1, 1)) : period
      },
    }
  }, [locale, t])
}

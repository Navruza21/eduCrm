import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { en } from './locales/en'
import { ru, type Dictionary } from './locales/ru'
import { uz } from './locales/uz'

export const LOCALES = ['ru', 'uz', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const LOCALE_NAMES: Record<Locale, string> = {
  ru: 'Русский',
  uz: "O'zbekcha",
  en: 'English',
}

/** BCP 47 tags for Intl number and date formatting. */
export const INTL_LOCALES: Record<Locale, string> = {
  ru: 'ru-RU',
  uz: 'uz-Latn-UZ',
  en: 'en-US',
}

const dictionaries: Record<Locale, Dictionary> = { ru, uz, en }

type LocaleState = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'ru',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'edu-crm-locale' },
  ),
)

export const useLocale = () => useLocaleStore((state) => state.locale)

export const useT = (): Dictionary => dictionaries[useLocale()]

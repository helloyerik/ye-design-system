/**
 * Minimal i18n: English is the default and the source of keys; Russian ('ru') is the secondary locale.
 * Missing keys fall back to English, then to the key itself. `{name}` placeholders; plural via Intl.PluralRules.
 * Usage: const t = createT({ en, ru }, pickLocale()); t('trash.empty', { n: 3 })
 */
export type Locale = 'en' | 'ru'
export type Messages = Record<string, string | Partial<Record<Intl.LDMLPluralRule, string>>>

/** English by default regardless of system language (owner decision 2026-10-15); 'ru' only when the user picks it. */
export function pickLocale(stored?: string | null): Locale {
  return stored === 'ru' ? 'ru' : 'en'
}

export function createT(catalogs: { en: Messages } & Partial<Record<Locale, Messages>>, locale: Locale = 'en') {
  const rules = new Intl.PluralRules(locale)
  return (key: string, vars: Record<string, string | number> = {}): string => {
    const m = catalogs[locale]?.[key] ?? catalogs.en[key]
    if (m == null) return key
    let s = typeof m === 'string' ? m : (m[typeof vars.n === 'number' ? rules.select(vars.n) : 'other'] ?? m.other ?? key)
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
    return s
  }
}

/** Keys present in en but missing in another catalog — for a CI check. */
export const missingKeys = (en: Messages, other: Messages) => Object.keys(en).filter((k) => !(k in other))

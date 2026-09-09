import { defaultLocale } from './config';

export function normalizeIntlLocale(locale: unknown): string {
  const candidate = typeof locale === 'string' ? locale.replaceAll('_', '-') : '';

  try {
    return Intl.getCanonicalLocales(candidate)[0] || defaultLocale;
  } catch {
    return defaultLocale;
  }
}

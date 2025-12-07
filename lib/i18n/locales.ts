/**
 * Locale utilities
 */

export type Locale = 'en' | 'fr';

export const locales: Locale[] = ['en', 'fr'];
export const defaultLocale: Locale = 'en';

export function isValidLocale(locale: any): locale is Locale {
  return locales.includes(locale);
}

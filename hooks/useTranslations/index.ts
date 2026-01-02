'use client';

import { useLanguage } from '../useLanguage';
import { translations } from '@/lib/i18n/translations';

/**
 * Hook to get translations for current language
 * Usage: const t = useTranslations(); t.nav.home
 */
export function useTranslations() {
  const { language } = useLanguage();
  return translations[language];
}

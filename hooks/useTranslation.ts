/**
 * Hook for using translations
 */

import { useLanguage } from './useLanguage';
import { t } from '@/lib/i18n/translations';

export function useTranslation() {
  const { language } = useLanguage();

  return {
    t: (path: string) => t(language, path),
    language,
  };
}

/**
 * Hook to get current locale from URL
 */

'use client';

import { useParams } from 'next/navigation';
import type { Locale } from '@/lib/i18n/locales';

export function useLocale(): Locale {
  const params = useParams();
  const locale = params?.lang as Locale;
  return locale || 'en';
}

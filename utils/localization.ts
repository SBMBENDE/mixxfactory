/**
 * Localization Utilities
 * Helper functions for displaying localized content
 */

import { Professional } from '@/types';

/**
 * Get localized description based on current language
 * Falls back to English description if French translation is not available
 */
export function getLocalizedDescription(
  professional: Professional,
  language: 'en' | 'fr'
): string {
  if (language === 'fr' && professional.descriptionFr) {
    return professional.descriptionFr;
  }
  return professional.description;
}

/**
 * Get localized bio based on current language
 * Falls back to English bio if French translation is not available
 */
export function getLocalizedBio(
  professional: Professional & { bioFr?: string },
  language: 'en' | 'fr'
): string | undefined {
  if (language === 'fr' && professional.bioFr) {
    return professional.bioFr;
  }
  return professional.bio;
}

/**
 * Category name translation utility
 */

export function getCategoryNameTranslation(categorySlug: string, language: 'en' | 'fr'): string {
  const translations: Record<string, Record<'en' | 'fr', string>> = {
    dj: {
      en: 'DJ',
      fr: 'DJs',
    },
    'event-hall': {
      en: 'Event Hall',
      fr: 'Salles d\'événements',
    },
    stylist: {
      en: 'Stylist',
      fr: 'Coiffeurs',
    },
    restaurant: {
      en: 'Restaurant',
      fr: 'Restaurants',
    },
    nightclub: {
      en: 'Nightclub',
      fr: 'Boîtes de nuit',
    },
    cameraman: {
      en: 'Cameraman',
      fr: 'Caméramans',
    },
    promoter: {
      en: 'Promoter',
      fr: 'Promoteurs',
    },
    decorator: {
      en: 'Decorator',
      fr: 'Décorateurs',
    },
    caterer: {
      en: 'Caterer',
      fr: 'Traiteurs',
    },
    florist: {
      en: 'Florist',
      fr: 'Fleuristes',
    },
    tech: {
      en: 'Tech',
      fr: 'Technologie',
    },
    'transport-service': {
      en: 'Transport Service',
      fr: 'Service de transport',
    },
  };

  return translations[categorySlug]?.[language] || categorySlug;
}

/**
 * Newsletter Translations
 * English and French translations for newsletter component
 */

export type Language = 'en' | 'fr';

export const newsletterTranslations = {
  en: {
    title: 'Subscribe to Our Newsletter',
    subtitle:
      'Get the latest updates, exclusive offers, and industry insights delivered to your inbox.',
    placeholder: 'Enter your email address',
    namePlaceholder: 'Your name (optional)',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing! Check your email for confirmation.',
    errorMessage: 'Failed to subscribe',
    networkError: 'Network error. Please try again later.',
    alreadySubscribed: 'Already subscribed with this email',
    privacyMessage: 'We respect your privacy. Unsubscribe at any time.',
  },
  fr: {
    title: 'Restez informé avec MixxFactory',
    subtitle:
      'Recevez des offres exclusives, de nouveaux profils de professionnels et les actualités du secteur directement dans votre boîte mail.',
    placeholder: 'Entrez votre adresse e-mail',
    namePlaceholder: 'Votre nom (optionnel)',
    buttonText: 'S\'abonner',
    successMessage:
      'Merci de vous être abonné ! Vérifiez votre e-mail pour la confirmation.',
    errorMessage: 'Échec de l\'abonnement',
    networkError: 'Erreur réseau. Veuillez réessayer plus tard.',
    alreadySubscribed: 'Déjà abonné à cet e-mail',
    privacyMessage: 'Nous respectons votre vie privée. Désinscription possible à tout moment.',
  },
};

export function getNewsletterText(lang: Language): (typeof newsletterTranslations)['en'] {
  return newsletterTranslations[lang] || newsletterTranslations.en;
}

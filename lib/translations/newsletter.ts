/**
 * Newsletter Translations
 * English and French translations for newsletter component
 */

export type Language = 'en' | 'fr';

export const newsletterTranslations = {
  en: {
    title: 'Stay updated',
    subtitle:
      'Get events & new professionals delivered to you.',
    placeholder: 'Enter your email address',
    namePlaceholder: 'Your name (optional)',
    buttonText: 'Subscribe',
    successMessage: 'Thank you for subscribing! Check your email for confirmation.',
    errorMessage: 'Failed to subscribe',
    networkError: 'Network error. Please try again later.',
    alreadySubscribed: 'Already subscribed with this email',
    privacyMessage: 'We respect your privacy.',
  },
  fr: {
    title: 'Restez informé',
    subtitle:
      'Recevez les événements et les nouveaux professionnels directement.',
    placeholder: 'Entrez votre adresse e-mail',
    namePlaceholder: 'Votre nom (optionnel)',
    buttonText: 'S\'abonner',
    successMessage:
      'Merci de vous être abonné ! Vérifiez votre e-mail pour la confirmation.',
    errorMessage: 'Échec de l\'abonnement',
    networkError: 'Erreur réseau. Veuillez réessayer plus tard.',
    alreadySubscribed: 'Déjà abonné à cet e-mail',
    privacyMessage: 'Nous respectons votre vie privée.',
  },
};

export function getNewsletterText(lang: Language): (typeof newsletterTranslations)['en'] {
  return newsletterTranslations[lang] || newsletterTranslations.en;
}

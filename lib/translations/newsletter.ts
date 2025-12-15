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
  },
  fr: {
    title: "S'abonner à notre infolettre",
    subtitle:
      'Recevez les dernières mises à jour, les offres exclusives et les perspectives de l\'industrie directement dans votre boîte de réception.',
    placeholder: 'Entrez votre adresse e-mail',
    namePlaceholder: 'Votre nom (optionnel)',
    buttonText: "S'abonner",
    successMessage:
      'Merci de vous être abonné ! Vérifiez votre e-mail pour la confirmation.',
    errorMessage: 'Échec de l\'abonnement',
    networkError: 'Erreur réseau. Veuillez réessayer plus tard.',
    alreadySubscribed: 'Déjà abonné à cet e-mail',
  },
};

export function getNewsletterText(lang: Language): (typeof newsletterTranslations)['en'] {
  return newsletterTranslations[lang] || newsletterTranslations.en;
}

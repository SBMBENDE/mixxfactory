/**
 * Newsletter Signup Component
 * Beautiful, responsive newsletter subscription form with multi-language support
 */

'use client';

import { useState } from 'react';
import { Language, getNewsletterText } from '@/lib/translations/newsletter';

interface NewsletterProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'dark' | 'gradient';
  language?: Language;
}

export function Newsletter({
  fullWidth = false,
  variant = 'default',
  language = 'en',
  title,
  subtitle,
  placeholder,
  buttonText,
}: NewsletterProps) {
  // Get translations for the selected language
  const translations = getNewsletterText(language);
  
  // Use provided strings or fall back to translations
  const finalTitle = title || translations.title;
  const finalSubtitle = subtitle || translations.subtitle;
  const finalPlaceholder = placeholder || translations.placeholder;
  const finalButtonText = buttonText || translations.buttonText;
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        const errorMsg = data.error === 'Already subscribed with this email' 
          ? translations.alreadySubscribed
          : data.error || data.message || translations.errorMessage;
        setMessage(errorMsg);
        setLoading(false);
        return;
      }

      setStatus('success');
      setMessage(translations.successMessage);
      setEmail('');
      setFirstName('');
      setLoading(false);

      // Reset message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setMessage(translations.networkError);
      setLoading(false);
    }
  };

  // Variant styles
  const variants = {
    default: {
      container: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
      text: 'text-gray-900 dark:text-white',
      input:
        'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400',
      button:
        'bg-blue-600 hover:bg-blue-700 text-white focus:bg-blue-800',
    },
    dark: {
      container: 'bg-gray-900 dark:bg-black border border-gray-800',
      text: 'text-white',
      input:
        'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500',
      button:
        'bg-blue-600 hover:bg-blue-700 text-white focus:bg-blue-800',
    },
    gradient: {
      container:
        'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 border border-blue-500',
      text: 'text-white',
      input:
        'bg-white/10 backdrop-blur border border-white/30 text-white placeholder-white/70 focus:border-white focus:bg-white/20',
      button:
        'bg-white hover:bg-gray-100 text-blue-600 hover:text-indigo-600 font-semibold',
    },
  };

  const style = variants[variant];

  return (
    <section
      className={`relative ${fullWidth ? 'w-full' : 'max-w-2xl'} mx-auto px-4 py-12 md:py-16`}
    >
      <div
        className={`rounded-lg shadow-lg p-8 md:p-12 ${style.container}`}
        style={{
          boxShadow:
            variant === 'gradient'
              ? '0 20px 25px rgba(0, 0, 0, 0.15), 0 0 40px rgba(59, 130, 246, 0.2)'
              : undefined,
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${style.text}`}>
            {finalTitle}
          </h2>
          <p
            className={`text-lg ${
              variant === 'gradient' ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {finalSubtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Optional) */}
          <div>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={translations.namePlaceholder}
              className={`w-full px-4 py-3 rounded-lg transition-colors duration-200 ${style.input} focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                variant === 'dark' ? 'focus:ring-blue-500' : ''
              }`}
              disabled={loading}
            />
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={finalPlaceholder}
              required
              className={`w-full px-4 py-3 rounded-lg transition-colors duration-200 ${style.input} focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                variant === 'dark' ? 'focus:ring-blue-500' : ''
              }`}
              disabled={loading}
            />
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 flex items-center gap-2">
                <span className="text-lg">✓</span>
                {message}
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 flex items-center gap-2">
                <span className="text-lg">⚠</span>
                {message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${style.button} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">◌</span>
                {language === 'fr' ? 'Abonnement en cours...' : 'Subscribing...'}
              </>
            ) : (
              finalButtonText
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          className={`text-center text-sm mt-6 ${
            variant === 'gradient'
              ? 'text-white/80'
              : 'text-gray-500 dark:text-gray-500'
          }`}
        >
          {language === 'fr'
            ? 'Nous respectons votre vie privée. Désinscrivez-vous à tout moment.'
            : 'We respect your privacy. Unsubscribe at any time.'}
        </p>
      </div>

      {/* Decorative elements for gradient variant */}
      {variant === 'gradient' && (
        <>
          <div
            className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"
            style={{ pointerEvents: 'none' }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            style={{ pointerEvents: 'none' }}
          />
        </>
      )}
    </section>
  );
}

export default Newsletter;

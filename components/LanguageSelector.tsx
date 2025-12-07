/**
 * Language Selector Component
 */

'use client';

import { useLanguage } from '@/hooks/useLanguage';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button
        onClick={() => setLanguage('en')}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db',
          backgroundColor: language === 'en' ? '#2563eb' : 'white',
          color: language === 'en' ? 'white' : '#374151',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s',
        }}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('fr')}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db',
          backgroundColor: language === 'fr' ? '#2563eb' : 'white',
          color: language === 'fr' ? 'white' : '#374151',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s',
        }}
        title="Français"
      >
        FR
      </button>
    </div>
  );
}

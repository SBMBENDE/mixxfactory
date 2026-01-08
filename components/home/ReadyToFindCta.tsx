/**
 * Ready to Find CTA Section - Client Component
 * Uses translations for bilingual support
 */

'use client';

import { useTranslations } from '@/hooks/useTranslations';

export default function ReadyToFindCta() {
  const t = useTranslations();

  return (
    <section style={{
      padding: '4rem 1rem',
      backgroundColor: '#f3f4f6',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        {t.home?.readyToFind || 'Ready to Find Your Perfect Professional?'}
      </h2>
      <a
        href="/directory"
        style={{
          display: 'inline-block',
          padding: '1rem 2rem',
          backgroundColor: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontWeight: 'bold',
        }}
      >
        {t.home?.browseCta || 'Browse All Professionals'}
      </a>
    </section>
  );
}

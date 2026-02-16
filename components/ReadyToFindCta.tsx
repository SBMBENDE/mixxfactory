"use client";
import { useTranslations } from '@/hooks/useTranslations';

export default function ReadyToFindCta() {
  const t = useTranslations();
  return (
    <section style={{
      padding: '4rem 1rem',
      background: 'linear-gradient(135deg, #1e40af 0%, #0f172a 50%, #000000 100%)',
      color: 'white',
      textAlign: 'center',
      margin: '4rem 0',
      borderRadius: '1.5rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        letterSpacing: '-0.02em',
      }}>
        {(t.home?.readyToFind || 'Ready to Find Your Perfect Professional?')}
      </h2>
      <p style={{
        fontSize: '1.25rem',
        marginBottom: '2.5rem',
        color: 'rgba(255,255,255,0.92)',
      }}>
        {(t.home?.browseDescription || 'Browse our directory of top-rated professionals and venues for your next event.')}
      </p>
      <a
        href="/directory"
        style={{
          display: 'inline-block',
          padding: '1rem 2.5rem',
          background: 'white',
          color: '#2563eb',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '1.125rem',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(30,64,175,0.10)',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        {(t.home?.browseCta || 'Browse All Professionals')}
      </a>
    </section>
  );
}
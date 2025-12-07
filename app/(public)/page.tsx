/**
 * Home page
 */

'use client';

import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { useTranslations } from '@/hooks/useTranslations';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const t = useTranslations();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetch('/api/auth/me', { credentials: 'include' });
      } catch {
        // Not authenticated
      }
    };
    checkAuth();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section style={{
        padding: '3rem 1rem',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)',
        color: 'white',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {t.home.title}
            </h1>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: '#f0f9ff' }}>
              {t.home.subtitle}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a 
                href="/directory"
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: 'white',
                  color: '#2563eb',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                {t.home.browseDir}
              </a>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: '#f97316',
                  color: 'white',
                  borderRadius: '0.375rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                {t.home.registerBtn}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section style={{ padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>
            {t.home.popularCategories}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {[
              { nameKey: 'dj', slug: 'dj', emoji: '🎧' },
              { nameKey: 'eventHall', slug: 'event-hall', emoji: '🏛️' },
              { nameKey: 'stylist', slug: 'stylist', emoji: '✨' },
              { nameKey: 'restaurant', slug: 'restaurant', emoji: '🍽️' },
              { nameKey: 'nightclub', slug: 'nightclub', emoji: '🌙' },
              { nameKey: 'cameraman', slug: 'cameraman', emoji: '📹' },
              { nameKey: 'promoter', slug: 'promoter', emoji: '📢' },
              { nameKey: 'decorator', slug: 'decorator', emoji: '🎨' },
            ].map((cat) => (
              <a
                key={cat.slug}
                href={`/directory?category=${cat.slug}`}
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  borderRadius: '0.5rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.emoji}</div>
                <p style={{ fontWeight: '600', color: '#111827' }}>{t.categories[cat.nameKey as keyof typeof t.categories]}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 1rem',
        backgroundColor: '#f3f4f6',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {t.home.featuredTitle}
          </h2>
          <p style={{
            color: '#4b5563',
            marginBottom: '2rem',
            maxWidth: '500px',
            margin: '0 auto 2rem',
            fontSize: '1rem',
          }}>
            {t.home.featuredDesc}
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              padding: '0.875rem 2rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            {t.home.getStarted}
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

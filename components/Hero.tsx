/**
 * Hero Section - Server Component
 * Static content, no interactivity needed
 */

'use client';

import { useState, useEffect } from 'react';

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section
      style={{
        paddingTop: isMobile ? '4rem' : '6rem',
        paddingBottom: isMobile ? '2rem' : '4rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)',
        color: 'white',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'left' }}>
          <h2
            style={{
              fontSize: isMobile ? '2.5rem' : '3.5rem',
              fontWeight: 'bold',
              marginBottom: isMobile ? '1rem' : '1.5rem',
              marginTop: '2rem',
              lineHeight: '1.2',
              letterSpacing: '0.02em',
              color: 'white',
              textShadow:
                '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(249, 115, 22, 0.2)',
            }}
          >
            MixxFactory
          </h2>

          <h1
            style={{
              fontSize: isMobile ? '1.75rem' : '2rem',
              fontWeight: 'bold',
              marginBottom: '2.5rem',
              lineHeight: isMobile ? '1.15' : '1.4',
              maxWidth: isMobile ? '100%' : '700px',
            }}
          >
            Discover Verified & Trusted Professionals
          </h1>

          <p
            style={{
              fontSize: isMobile ? '1rem' : '1.25rem',
              marginBottom: '2.5rem',
              color: '#f0f9ff',
              lineHeight: '1.6',
              maxWidth: isMobile ? '100%' : '550px',
              fontWeight: '500',
            }}
          >
            Access trusted professionals, venues, and events near you — instantly.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '1rem' : '1.5rem',
              maxWidth: isMobile ? '100%' : '600px',
            }}
          >
            <a
              href="/directory"
              style={{
                padding: isMobile ? '1rem' : '1.125rem 1.5rem',
                backgroundColor: 'rgb(249, 115, 22)',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: isMobile ? '0.95rem' : '1rem',
                cursor: 'pointer',
                border: '2px solid rgb(249, 115, 22)',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(234, 88, 12)';
                e.currentTarget.style.borderColor = 'rgb(234, 88, 12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(249, 115, 22)';
                e.currentTarget.style.borderColor = 'rgb(249, 115, 22)';
              }}
            >
              Find a professional
            </a>

            <a
              href="/events"
              style={{
                padding: isMobile ? '1rem' : '1.125rem 1.5rem',
                backgroundColor: 'transparent',
                color: 'white',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: isMobile ? '0.95rem' : '1rem',
                cursor: 'pointer',
                border: '2px solid white',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                display: 'block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Explore events
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

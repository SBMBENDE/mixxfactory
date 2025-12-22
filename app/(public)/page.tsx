/**
 * Home page
 */

'use client';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { useTranslations } from '@/hooks/useTranslations';
import { StickySearchBar } from '@/components/StickySearchBar';
import NewsFlashBanner from '@/components/NewsFlashBanner';
import Newsletter from '@/components/Newsletter';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import PopularCategories from '@/components/PopularCategories';
import FeaturedProfessionals from '@/components/FeaturedProfessionals';

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  // Detect mobile window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Sticky Search Bar */}
      <StickySearchBar />

      {/* Hero Section - Mobile First */}
      <section style={{
        paddingTop: isMobile ? '4rem' : '6rem',
        paddingBottom: isMobile ? '2rem' : '4rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)',
        color: 'white',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'left' }}>
            {/* MixxFactory Branding */}
            <h2 style={{ 
              fontSize: isMobile ? '2.5rem' : '3.5rem', 
              fontWeight: 'bold', 
              marginBottom: isMobile ? '1rem' : '1.5rem',
              marginTop: '2rem',
              lineHeight: '1.2',
              letterSpacing: '0.02em',
              color: 'white',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.3), 0 0 40px rgba(249, 115, 22, 0.2)'
            }}>
              MixxFactory
            </h2>
            
            {/* Main Title with Line Breaks */}
            <h1 style={{ 
              fontSize: isMobile ? '1.75rem' : '2rem', 
              fontWeight: 'bold', 
              marginBottom: '2.5rem',
              lineHeight: isMobile ? '1.15' : '1.4',
              maxWidth: isMobile ? '100%' : '700px',
              whiteSpace: 'pre-line'
            }}>
              {t.home.title}
            </h1>
            
            <p style={{ 
              fontSize: isMobile ? '1rem' : '1.25rem', 
              marginBottom: '2.5rem', 
              color: '#f0f9ff',
              lineHeight: '1.6',
              maxWidth: isMobile ? '100%' : '550px',
              fontWeight: '500'
            }}>
              {t.home.subtitle}
            </p>
            
            {/* Two Primary CTAs - Mobile: stack vertically, Desktop: side by side */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '1rem' : '1.5rem',
              maxWidth: isMobile ? '100%' : '600px'
            }}>
              {/* Find a Professional - Primary CTA */}
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
                  display: 'block'
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
                {t.home.discoverBtn}
              </a>

              {/* View Events - Secondary CTA */}
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
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {t.home.eventsBtn}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* News Flash Banner */}
      <section style={{ padding: '1rem', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
          <NewsFlashBanner />
        </div>
      </section>

      {/* Popular Categories - Horizontal Scroll */}
      <PopularCategories />

      {/* Featured Professionals - Grid */}
      <FeaturedProfessionals />

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

      {/* Newsletter Section */}
      <section style={{
        padding: '4rem 1rem',
        backgroundColor: '#ffffff',
      }}>
        <Newsletter
          variant="gradient"
          fullWidth={false}
        />
      </section>

      {/* Testimonial Carousel Section */}
      <TestimonialCarousel />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

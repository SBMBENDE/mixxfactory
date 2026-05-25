/**
 * FeaturedProfessionals Client Component
 * Mobile-first with horizontal scroll, desktop grid
 * Multiple curated sections: Featured, Top Rated
 * 
 * Animation Strategy:
 * - Section title: Fade in from bottom
 * - Cards: Staggered fade-up on scroll (reveals as user scrolls)
 * - Improves perceived performance by loading content progressively
 */

'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { AppImage } from '@/components/AppImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from '@/hooks/useTranslations';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/useGSAP';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Professional {
  _id: string;
  name: string;
  slug: string;
  email: string;
  images?: string[];
  gallery?: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  category?: string;
  availability?: Record<string, boolean>;
  subscriptionTier?: string;
}

interface Props {
  professionals: Professional[];
}

export default function FeaturedProfessionalsServer({ professionals }: Props) {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll-triggered animations for cards
  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.professional-card');
    
    // Batch animate cards as they enter viewport
    ScrollTrigger.batch(cards, {
      onEnter: (batch) => {
        gsap.fromTo(
          batch,
          {
            opacity: 0,
            y: 50,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      },
      start: 'top 85%',
      once: true, // Only animate once for performance
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [prefersReducedMotion, professionals]);

  if (!professionals || professionals.length === 0) {
    return null;
  }

  // Helper function to check if professional is available today
  const isAvailableToday = (professional: Professional): boolean | null => {
    if (!professional.availability) return null; // no data — hide badge
    const today = new Date().toISOString().split('T')[0];
    if (professional.availability[today] === true) return true;
    if (professional.availability[today] === false) return false;
    return null; // date not set — hide badge
  };

  // Split into sections: Featured (max 8), Top Rated (max 8)
  const featuredPros = professionals.filter(p => p.featured).slice(0, 8);
  const topRatedPros = professionals
    .filter(p => !p.featured)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  const renderProfessionalCard = (professional: Professional) => {
    // TEMP DEBUG: Log professional object for specific emails
    if (["info@digicorepro.com", "chefsuzypassion@gmail.com", "mbende2000@hotmail.com"].includes(professional.email)) {
      // eslint-disable-next-line no-console
      console.log("[DEBUG] Professional Data:", professional);
    }
    return (
    <Link
      key={professional._id}
      href={`/professionals/${professional.slug}`}
      className="professional-card"
      style={{
        flex: '0 0 auto',
        width: '280px',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}>
        {/* Image */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1',
          backgroundColor: '#f3f4f6',
          overflow: 'hidden',
        }}>
          {(professional.images?.[0] || professional.gallery?.[0]) ? (
            <AppImage
              src={professional.images?.[0] || professional.gallery?.[0] || ''}
              alt={professional.name}
              fill
              sizes="280px"
              className="w-full h-full"
              objectFit="cover"
              priority={false}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
            }}>
              👤
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1rem' }}>
          {/* Badges Row */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {/* Featured Badge */}
            {professional.featured && (
              <span style={{
                display: 'inline-block',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}>
                ⭐ FEATURED
              </span>
            )}

            {/* Availability Badge - Only shown when explicitly set */}
            {isAvailableToday(professional) !== null && (
              <span style={{
                display: 'inline-block',
                backgroundColor: isAvailableToday(professional) ? '#d1fae5' : '#f3f4f6',
                color: isAvailableToday(professional) ? '#065f46' : '#6b7280',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: `1px solid ${isAvailableToday(professional) ? '#10b981' : '#d1d5db'}`,
              }}>
                {isAvailableToday(professional) ? '✓ AVAILABLE' : '○ UNAVAILABLE'}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#1f2937',
            lineHeight: '1.3',
          }}>
            {professional.name}
          </h3>

          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            color: '#f59e0b',
            marginBottom: '0.75rem',
          }}>
            <FontAwesomeIcon icon={faStar} style={{ width: '1rem', height: '1rem' }} />
            <span>{professional.rating.toFixed(1)}</span>
            <span style={{ color: '#9ca3af' }}>
              ({professional.reviewCount})
            </span>
          </div>

          {/* CTA */}
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#2563eb',
            fontWeight: '500',
            fontSize: '0.875rem',
          }}>
            {t.home?.viewProfile || 'View Profile'}
            <FontAwesomeIcon icon={faArrowRight} style={{ width: '0.75rem', height: '0.75rem' }} />
          </div>
        </div>
      </div>
    </Link>
  );
  };

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '3rem 0',
        backgroundColor: 'white',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Featured Professionals Section */}
        {featuredPros.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#1f2937',
              }}>
                {t.home?.featuredProfessionals || 'Featured Professionals'}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                {t.home?.premiumVerifiedProfessionals || 'Premium verified professionals'}
              </p>
            </div>

            {/* Mobile: Horizontal Scroll, Desktop: Grid */}
            <div className="professionals-container"
              style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                padding: '0 1rem 1rem',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
              }}
            >
              {featuredPros.map(renderProfessionalCard)}
            </div>
          </div>
        )}

        {/* Top Rated Section */}
        {topRatedPros.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#1f2937',
              }}>
                🏆 {t.home.topRatedProfessionals}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                Highly rated by our community
              </p>
            </div>

            {/* Mobile: Horizontal Scroll, Desktop: Grid */}
            <div className="professionals-container"
              style={{
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                padding: '0 1rem 1rem',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x mandatory',
              }}
            >
              {topRatedPros.map(renderProfessionalCard)}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <Link
            href="/directory"
            className="browse-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            {t.home?.browseCta || 'View All Professionals'}
            <FontAwesomeIcon icon={faArrowRight} style={{ width: '1rem', height: '1rem' }} />
          </Link>
        </div>
      </div>

      <style>{`
        /* Professional card hover effect */
        .professional-card > div {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .professional-card:hover > div {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px rgba(0,0,0,0.15);
        }

        /* Horizontal scroll styling - show 1.2 cards on mobile */
        .professionals-container {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .professionals-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        
        /* Scroll snap for smooth swiping */
        .professionals-container > * {
          scroll-snap-align: start;
        }

        /* Show hint of next card on mobile */
        @media (max-width: 768px) {
          .professional-card {
            width: calc(85vw - 2rem) !important;
            max-width: 320px;
          }
        }

        /* Desktop: Use grid instead of horizontal scroll */
        @media (min-width: 769px) {
          .professionals-container {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            overflow-x: visible !important;
            padding: 0 1rem !important;
          }
          .professional-card {
            width: 100% !important;
          }
        }

        /* Button hover */
        .browse-btn:hover {
          background: linear-gradient(135deg, #1e3a8a 0%, #000000 100%);
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}

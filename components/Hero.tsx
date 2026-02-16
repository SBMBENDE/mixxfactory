/**
 * Hero Section - Client Component with GSAP Animations
 * 
 * Animation Strategy:
 * - Brand name: Fade + scale from center (premium feel)
 * - Headline: Fade up with slight delay (hierarchy)
 * - Subtext: Fade up with stagger (readability)
 * - CTAs: Scale up with bounce (call attention)
 * 
 * UX Benefits:
 * ✓ Creates visual hierarchy (brand → headline → action)
 * ✓ Builds anticipation with stagger timing
 * ✓ Draws eye to CTAs with elastic ease
 * ✓ Respects prefers-reduced-motion
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useGSAP, ANIMATION_DEFAULTS } from '@/hooks/useGSAP';
import gsap from 'gsap';

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslations();
  
  // Animation refs
  const brandRef = useRef<HTMLHeadingElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hero entrance animation
  useGSAP(() => {
    const timeline = gsap.timeline({
      defaults: {
        ease: ANIMATION_DEFAULTS.ease.entrance,
      },
    });

    // Brand name: Fade + scale from 0.9 (premium entrance)
    timeline.fromTo(
      brandRef.current,
      {
        opacity: 0,
        scale: 0.95,
        y: -20,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: ANIMATION_DEFAULTS.duration.slow,
      }
    );

    // Headline: Fade up after brand
    timeline.fromTo(
      headlineRef.current,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: ANIMATION_DEFAULTS.duration.normal,
      },
      '-=0.4' // Overlap slightly for smoother flow
    );

    // Subtext: Fade up with slight delay
    timeline.fromTo(
      subtextRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: ANIMATION_DEFAULTS.duration.normal,
      },
      '-=0.3'
    );

    // CTAs: Scale up with elastic bounce (draws attention)
    timeline.fromTo(
      ctasRef.current,
      {
        opacity: 0,
        y: 20,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: ANIMATION_DEFAULTS.duration.normal,
        ease: ANIMATION_DEFAULTS.ease.elastic,
      },
      '-=0.2'
    );
  }, []);

  return (
    <section
      style={{
        paddingTop: isMobile ? '4rem' : '6rem',
        paddingBottom: isMobile ? '2rem' : '4rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        background: 'linear-gradient(135deg, #1e40af 0%, #0f172a 50%, #000000 100%)',
        color: 'white',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'left' }}>
          <h2
            ref={brandRef}
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
            {t.home.brandName}
          </h2>

          <h1
            ref={headlineRef}
            style={{
              fontSize: isMobile ? '1.75rem' : '2rem',
              fontWeight: 'bold',
              marginBottom: '2.5rem',
              lineHeight: isMobile ? '1.15' : '1.4',
              maxWidth: isMobile ? '100%' : '700px',
            }}
          >
            {t.home.tagline}
          </h1>

          <p
            ref={subtextRef}
            style={{
              fontSize: isMobile ? '1rem' : '1.25rem',
              marginBottom: '2.5rem',
              color: '#f0f9ff',
              lineHeight: '1.6',
              maxWidth: isMobile ? '100%' : '550px',
              fontWeight: '500',
            }}
          >
            {t.home.subtitle}
          </p>

          <div
            ref={ctasRef}
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
              {t.home.discoverBtn}
            </a>

            <a
              href="/auth/register"
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
              {t.home.eventsBtn}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

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
import Image from 'next/image';
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
  const imageRef = useRef<HTMLDivElement>(null);
  const mobileImageRef = useRef<HTMLDivElement>(null);

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

    // Mobile image: Fade + scale from top
    if (isMobile && mobileImageRef.current) {
      timeline.fromTo(
        mobileImageRef.current,
        {
          opacity: 0,
          scale: 0.8,
          y: -30,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: ANIMATION_DEFAULTS.duration.slow,
        }
      );
    }

    // Brand name: Slide in from left with rotation
    timeline.fromTo(
      brandRef.current,
      {
        opacity: 0,
        x: -100,
        rotation: -5,
      },
      {
        opacity: 1,
        x: 0,
        rotation: 0,
        duration: ANIMATION_DEFAULTS.duration.slow,
      },
      isMobile ? '-=0.3' : '0'
    );

    // Headline: Fade up with slight rotation
    timeline.fromTo(
      headlineRef.current,
      {
        opacity: 0,
        y: 40,
        rotation: 2,
      },
      {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: ANIMATION_DEFAULTS.duration.slow,
      },
      '-=0.5'
    );

    // Subtext: Slide in from left
    timeline.fromTo(
      subtextRef.current,
      {
        opacity: 0,
        x: -50,
      },
      {
        opacity: 1,
        x: 0,
        duration: ANIMATION_DEFAULTS.duration.normal,
      },
      '-=0.4'
    );

    // CTAs: Pop in from different directions with stagger
    if (ctasRef.current) {
      const buttons = ctasRef.current.children;
      timeline.fromTo(
        buttons[0],
        {
          opacity: 0,
          x: -30,
          scale: 0.8,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: ANIMATION_DEFAULTS.duration.normal,
          ease: ANIMATION_DEFAULTS.ease.elastic,
        },
        '-=0.3'
      );

      timeline.fromTo(
        buttons[1],
        {
          opacity: 0,
          x: 30,
          scale: 0.8,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: ANIMATION_DEFAULTS.duration.normal,
          ease: ANIMATION_DEFAULTS.ease.elastic,
        },
        '-=0.5'
      );
    }

    // Desktop image: Fade in from right with rotation
    if (!isMobile && imageRef.current) {
      timeline.fromTo(
        imageRef.current,
        {
          opacity: 0,
          x: 100,
          rotation: 10,
        },
        {
          opacity: 1,
          x: 0,
          rotation: 0,
          duration: ANIMATION_DEFAULTS.duration.slow * 1.2,
          ease: ANIMATION_DEFAULTS.ease.smooth,
        },
        '-=1.2'
      );

      // Add continuous floating animation for desktop image
      gsap.to(imageRef.current, {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, [isMobile]);

  return (
    <section
      style={{
        paddingTop: isMobile ? '3rem' : '6rem',
        paddingBottom: isMobile ? '3rem' : '4rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        background: 'linear-gradient(135deg, #1e40af 0%, #0f172a 50%, #000000 100%)',
        color: 'white',
        overflow: 'hidden',
        minHeight: isMobile ? '100vh' : 'auto',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Mobile logo at top */}
        {isMobile && (
          <div 
            ref={mobileImageRef}
            style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{
              width: '150px',
              height: '150px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Glow effect */}
              <div style={{
                position: 'absolute',
                inset: '-30%',
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }} />
              
              <Image 
                src="https://res.cloudinary.com/dkd3k6eau/image/upload/e_background_removal/e_dropshadow:azimuth_220;elevation_60;spread_20/f_png/v1771255050/afrobizz-logo_aaau43.jpg" 
                alt="Afrobizz - Connect Africa"
                width={150}
                height={150}
                priority
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            </div>
          </div>
        )}

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '2rem' : '4rem',
          alignItems: 'center',
        }}>
          {/* Left side - Text content */}
          <div style={{ textAlign: 'left' }}>
            <h2
              ref={brandRef}
              style={{
                fontSize: isMobile ? '2rem' : '3.5rem',
                fontWeight: 'bold',
                marginBottom: isMobile ? '0.75rem' : '1.5rem',
                marginTop: '0',
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
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: 'bold',
                marginBottom: isMobile ? '1.5rem' : '2.5rem',
                lineHeight: isMobile ? '1.15' : '1.4',
                maxWidth: '100%',
              }}
            >
              {t.home.tagline}
            </h1>

            <p
              ref={subtextRef}
              style={{
                fontSize: isMobile ? '0.95rem' : '1.25rem',
                marginBottom: isMobile ? '1.5rem' : '2.5rem',
                color: '#f0f9ff',
                lineHeight: '1.6',
                maxWidth: '100%',
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
                maxWidth: '100%',
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

          {/* Right side - Image (Desktop only) */}
          {!isMobile && (
            <div 
              ref={imageRef}
              style={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div style={{
                width: '400px',
                height: '400px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Glow effect behind logo */}
                <div style={{
                  position: 'absolute',
                  inset: '-20%',
                  background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                  animation: 'pulse 3s ease-in-out infinite',
                }} />
                
                {/* Logo image */}
                <Image 
                  src="https://res.cloudinary.com/dkd3k6eau/image/upload/e_background_removal/e_dropshadow:azimuth_220;elevation_60;spread_20/f_png/v1771255050/afrobizz-logo_aaau43.jpg" 
                  alt="Afrobizz - Connect Africa"
                  width={400}
                  height={400}
                  priority
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
      `}</style>
    </section>
  );
}

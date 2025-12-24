/**
 * Homepage with Progressive Streaming
 * 
 * STRATEGY:
 * - Hero renders instantly (no Suspense)
 * - Categories stream in (Suspense boundary)
 * - Professionals stream in (Suspense boundary)
 * - Each component owns its own data fetching
 * 
 * Why this works:
 * ✅ Hero above-the-fold visible immediately
 * ✅ Page interactive while data streams
 * ✅ Each Suspense component fetches independently
 * ✅ Proper ISR revalidate at component level
 * ✅ Better perceived performance (TTFMC)
 */

export const revalidate = 60; // ISR: revalidate every 1 minute (faster updates for featured professionals)

import { Suspense } from 'react';
import Hero from '@/components/Hero';
import NewsFlashBanner from '@/components/NewsFlashBanner';
import PopularCategories from '@/components/PopularCategories';
import FeaturedProfessionals from '@/components/FeaturedProfessionals';
import Newsletter from '@/components/Newsletter';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { StickySearchBar } from '@/components/StickySearchBar';

// Fallback component - minimal, non-deceptive
function SectionFallback() {
  return <div style={{ height: '200px' }} />;
}

export default function Page() {
  return (
    <>
      {/* Sticky Search Bar - Interactive Client Component */}
      <StickySearchBar />

      {/* Hero Section - Renders INSTANTLY (no Suspense, no wait) */}
      <Hero />

      {/* News Flash Banner - Client Component */}
      <NewsFlashBanner />

      {/* Popular Categories - Streams in while page is interactive */}
      <Suspense fallback={<SectionFallback />}>
        <PopularCategories />
      </Suspense>

      {/* Featured Professionals - Streams in after categories */}
      <Suspense fallback={<SectionFallback />}>
        <FeaturedProfessionals />
      </Suspense>

      {/* CTA Section - Static, renders with Hero */}
      <section style={{
        padding: '4rem 1rem',
        backgroundColor: '#f3f4f6',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Ready to Find Your Perfect Professional?
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
          Browse All Professionals
        </a>
      </section>

      {/* Numbers/Stats Section */}
      <section style={{
        padding: '4rem 1rem',
        backgroundColor: '#ffffff',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '3rem',
          color: '#1f2937',
        }}>
          Trusted by Thousands
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: '0.5rem',
            }}>
              500+
            </h3>
            <p style={{ color: '#6b7280' }}>Active Professionals</p>
          </div>
          <div>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: '0.5rem',
            }}>
              10K+
            </h3>
            <p style={{ color: '#6b7280' }}>Happy Clients</p>
          </div>
          <div>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: '0.5rem',
            }}>
              50+
            </h3>
            <p style={{ color: '#6b7280' }}>Service Categories</p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      {/* Testimonials Section */}
      <TestimonialCarousel />
    </>
  );
}

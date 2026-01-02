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
import TrustedByThousandsSection from '@/components/TrustedByThousandsSection';

import Hero from '@/components/Hero';
import NewsFlashBanner from '@/components/NewsFlashBanner';
import PopularCategories from '@/components/PopularCategories';
import FeaturedProfessionals from '@/components/FeaturedProfessionals';
import Newsletter from '@/components/Newsletter';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import ReadyToFindCta from '@/components/ReadyToFindCta';
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


      {/* Numbers/Stats Section */}
      <TrustedByThousandsSection />


      {/* Ready to Find Your Perfect Professional Section */}
      <ReadyToFindCta />


      {/* Newsletter Section */}
      <Newsletter />

      {/* Testimonials Section */}
      <TestimonialCarousel />
    </>
  );
}

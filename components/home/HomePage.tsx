/**
 * HomePage Server Component Wrapper
 * Receives prerendered data from server
 * No client-side rendering needed for initial content
 */

import { Suspense } from 'react';
import FeaturedProfessionalsServer from '@/components/FeaturedProfessionalsServer';
import PopularCategoriesServer from '@/components/PopularCategoriesServer';
import Hero from '@/components/Hero';
import NewsFlashBanner from '@/components/NewsFlashBanner';
import Newsletter from '@/components/Newsletter';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { StickySearchBar } from '@/components/StickySearchBar';

interface HomePageProps {
  data: {
    professionals: any[];
    categories: any[];
    newsFlashes: any[];
  };
}

// Skeleton for suspense boundaries
function CategorySkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-24 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

function ProfessionalsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}

export default function HomePage({ data }: HomePageProps) {
  return (
    <>
      {/* Sticky Search Bar - Interactive Client Component */}
      <StickySearchBar />

      {/* Hero Section - Server Component */}
      <Hero />

      {/* News Flash Banner - Client Component */}
      <NewsFlashBanner />

      {/* Popular Categories - Server Component with Suspense */}
      <Suspense fallback={<CategorySkeleton />}>
        <PopularCategoriesServer categories={data.categories} />
      </Suspense>

      {/* Featured Professionals - Server Component with Suspense */}
      <Suspense fallback={<ProfessionalsSkeleton />}>
        <FeaturedProfessionalsServer professionals={data.professionals} />
      </Suspense>

      {/* CTA Section - Static Server Component */}
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

      {/* Testimonials - Server Component */}
      <TestimonialCarousel />

      {/* Newsletter - Interactive Client Component */}
      <Newsletter />
    </>
  );
}

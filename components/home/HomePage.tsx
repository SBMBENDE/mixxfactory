/**
 * HomePage Server Component Wrapper
 * Receives prerendered data from server
 * No client-side rendering needed for initial content
 */

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

export default function HomePage({ data }: HomePageProps) {
  return (
    <>
      {/* Sticky Search Bar - Interactive Client Component */}
      <StickySearchBar />

      {/* Hero Section - Server Component */}
      <Hero />

      {/* News Flash Banner - Client Component */}
      <NewsFlashBanner />

      {/* Popular Categories - Server Component */}
      {data.categories && data.categories.length > 0 && (
        <PopularCategoriesServer categories={data.categories} />
      )}

      {/* Featured Professionals - Server Component */}
      {data.professionals && data.professionals.length > 0 && (
        <FeaturedProfessionalsServer professionals={data.professionals} />
      )}

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

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
import { Footer } from '@/components/layout/Footer';

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
            }}>500+</h3>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
            }}>Professionals</p>
          </div>
          <div>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: '0.5rem',
            }}>10k+</h3>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
            }}>Happy Users</p>
          </div>
          <div>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: '0.5rem',
            }}>50+</h3>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
            }}>Categories</p>
          </div>
          <div>
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: '0.5rem',
            }}>24/7</h3>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
            }}>Support</p>
          </div>
        </div>
      </section>

      {/* Want to be Featured CTA Section */}
      <section style={{
        padding: '4rem 1rem',
        backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
        textAlign: 'center',
        color: 'white',
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
        }}>
          Want to be Featured?
        </h2>
        <p style={{
          fontSize: '1.125rem',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          lineHeight: '1.6',
        }}>
          Join thousands of professionals on MixxFactory and grow your business. Reach new clients and expand your network today.
        </p>
        <a
          href="/admin/auth"
          style={{
            display: 'inline-block',
            padding: '1rem 2.5rem',
            backgroundColor: 'white',
            color: '#f59e0b',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            cursor: 'pointer',
          }}
        >
          Get Started Now
        </a>
      </section>

      {/* Testimonials - Server Component */}
      <TestimonialCarousel />

      {/* Newsletter - Interactive Client Component */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </>
  );
}

/**
 * Home page
 */

'use client';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { useTranslations } from '@/hooks/useTranslations';
import Carousel from '@/components/Carousel';
import NewsFlashBanner from '@/components/NewsFlashBanner';
import Newsletter from '@/components/Newsletter';

// Emoji mapping for categories
const categoryEmojis: Record<string, string> = {
  dj: '🎧',
  'event-hall': '🏛️',
  stylist: '✨',
  restaurant: '🍽️',
  nightclub: '🌙',
  cameraman: '📹',
  promoter: '📢',
  decorator: '🎨',
  caterer: '🍽️',
  florist: '🌸',
};

// Map category slugs to translation keys
const categoryTranslationKeys: Record<string, string> = {
  dj: 'dj',
  'event-hall': 'eventHall',
  stylist: 'stylist',
  restaurant: 'restaurant',
  nightclub: 'nightclub',
  cameraman: 'cameraman',
  promoter: 'promoter',
  decorator: 'decorator',
  caterer: 'caterer',
  florist: 'florist',
};

function getEmojiForCategory(slug: string): string {
  return categoryEmojis[slug] || '⭐';
}

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
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

  // Fetch categories from API instead of hardcoding
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { name: 'DJs', slug: 'dj', nameKey: 'dj', emoji: '🎧' },
          { name: 'Event Halls', slug: 'event-hall', nameKey: 'eventHall', emoji: '🏛️' },
          { name: 'Stylists', slug: 'stylist', nameKey: 'stylist', emoji: '✨' },
          { name: 'Restaurants', slug: 'restaurant', nameKey: 'restaurant', emoji: '🍽️' },
          { name: 'Nightclubs', slug: 'nightclub', nameKey: 'nightclub', emoji: '🌙' },
          { name: 'Cameramen', slug: 'cameraman', nameKey: 'cameraman', emoji: '📹' },
          { name: 'Promoters', slug: 'promoter', nameKey: 'promoter', emoji: '📢' },
          { name: 'Decorators', slug: 'decorator', nameKey: 'decorator', emoji: '🎨' },
          { name: 'Caterers', slug: 'caterer', nameKey: 'caterer', emoji: '🍽️' },
          { name: 'Florists', slug: 'florist', nameKey: 'florist', emoji: '🌸' },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section style={{
        padding: '3rem 1rem',
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)',
        color: 'white',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {t.home.title}
            </h1>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: '#f0f9ff' }}>
              {isMobile ? t.home.subtitleMobile : t.home.subtitle}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a 
                href="/directory"
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: 'white',
                  color: '#2563eb',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                {t.home.browseDir}
              </a>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  padding: '0.875rem 2rem',
                  backgroundColor: '#f97316',
                  color: 'white',
                  borderRadius: '0.375rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                {t.home.registerBtn}
              </button>
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

      {/* Categories Preview - Carousel */}
      <section style={{ padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center' }}>
            {t.home.popularCategories}
          </h2>
          <div style={{ paddingLeft: '4rem', paddingRight: '4rem' }}>
            {!categoriesLoading && categories.length > 0 && (
              <Carousel
                items={categories.map((cat) => ({
                  nameKey: cat.slug,
                  slug: cat.slug,
                  emoji: getEmojiForCategory(cat.slug),
                }))}
                renderItem={(cat) => (
                  <a
                    href={`/directory?category=${cat.slug}`}
                    style={{
                      padding: '1.5rem',
                      textAlign: 'center',
                      borderRadius: '0.5rem',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      display: 'block',
                      height: '100%',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 25px rgba(37, 99, 235, 0.15)';
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{cat.emoji}</div>
                    <p style={{ fontWeight: '600', color: '#111827' }}>
                      {t.categories[categoryTranslationKeys[cat.slug] as keyof typeof t.categories] || categories.find((c) => c.slug === cat.slug)?.name}
                    </p>
                  </a>
                )}
                itemsPerView={4}
                autoScroll={true}
                autoScrollInterval={5000}
              />
            )}
            {categoriesLoading && <p style={{ textAlign: 'center', color: '#999' }}>{t.home.loadingCategories}</p>}
          </div>
        </div>
      </section>

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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

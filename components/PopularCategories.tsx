'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

// Emoji mapping for categories
const categoryEmojis: Record<string, string> = {
  dj: '🎧',
  'event-hall': '🏛️',
  stylist: '💇',
  restaurant: '🍽️',
  nightclub: '🌙',
  cameraman: '📹',
  promoter: '📢',
  decorator: '🎨',
  caterer: '🍽️',
  florist: '🌸',
  tech: '💻',
  'transport-service': '🚗',
  'cleaning-services': '🧹',
  childcare: '👶',
  'grocery-stores': '🛒',
  'handyman-services': '🔧',
};

function getEmojiForCategory(slug: string): string {
  return categoryEmojis[slug] || '⭐';
}

// Skeleton Loader with enhanced animation
function SkeletonCard() {
  return (
    <div
      style={{
        padding: '1.5rem',
        textAlign: 'center',
        borderRadius: '0.5rem',
        backgroundColor: '#f3f4f6',
        border: '1px solid #e5e7eb',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Shimmer effect overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          animation: 'shimmer 2s infinite',
        }}
      />
      <div
        style={{
          fontSize: '2rem',
          marginBottom: '0.5rem',
          opacity: 0.4,
          animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        ✨
      </div>
      <div
        style={{
          height: '1rem',
          backgroundColor: '#e5e7eb',
          borderRadius: '0.25rem',
          width: '60%',
          animation: 'skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
    </div>
  );
}

export default function PopularCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslations();

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Limit to 7 popular categories for horizontal scroll
          setCategories(data.data.slice(0, 7));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section style={{ padding: '3rem 1rem', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Title */}
        <h2
          style={{
            fontSize: isMobile ? '1.5rem' : '1.875rem',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#1f2937',
          }}
        >
          {t.home.popularCategories}
        </h2>

        {/* Horizontal Scroll Container */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            gap: '1rem',
            paddingBottom: '1rem',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {/* Hide scrollbar for webkit browsers */}
          <style>{`
            [data-categories-scroll]::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {loading ? (
            <>
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: '0 0 auto',
                    width: isMobile ? '100px' : '140px',
                    minWidth: isMobile ? '100px' : '140px',
                  }}
                >
                  <SkeletonCard />
                </div>
              ))}
            </>
          ) : (
            categories.map((category, index) => (
              <Link
                key={category._id}
                href={`/directory?category=${category.slug}`}
                style={{
                  flex: '0 0 auto',
                  width: isMobile ? '100px' : '140px',
                  minWidth: isMobile ? '100px' : '140px',
                  textDecoration: 'none',
                  color: 'inherit',
                  animation: `fadeInScale 0.5s ease-out ${index * 0.05}s both`,
                }}
              >
                <div
                  style={{
                    padding: isMobile ? '1rem' : '1.5rem',
                    textAlign: 'center',
                    borderRadius: '0.5rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.15)';
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div
                    style={{
                      fontSize: isMobile ? '2rem' : '2.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {getEmojiForCategory(category.slug)}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      wordBreak: 'break-word',
                    }}
                  >
                    {category.name}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Scroll Hint (Mobile Only) */}
        {!loading && isMobile && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.875rem',
              color: '#9ca3af',
            }}
          >
            ← Swipe to explore →
          </div>
        )}
      </div>

      {/* Enhanced animations */}
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
}

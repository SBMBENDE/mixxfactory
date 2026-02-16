"use client";
import { CategorySelect } from '@/components/ui/CategorySelect';
/**
 * Directory page - browse professionals
 * Uses Server Components + Suspense for initial load
 * Client component handles search/filter interactions
 * 
 * Animation Strategy:
 * - Header: Fade up entrance (establishes hierarchy)
 * - Search bar: Scale up with elastic bounce (draws attention)
 * - Professional cards: Staggered scroll reveal (progressive disclosure)
 * - Creates premium, polished first impression
 * 
 * KEY INSIGHT:
 * - Server renders initial professionals list (fast, no timeout)
 * - Client handles dynamic search/category filtering
 * - Suspense prevents blocking initial page load
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { AppImage } from '@/components/AppImage';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';
import { useGSAP, ANIMATION_DEFAULTS } from '@/hooks/useGSAP';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
// import { useLanguage } from '@/hooks/useLanguage';
// import { getCategoryNameTranslation } from '@/lib/utils/category-translation';

// Emoji mapping for categories
// Removed unused categoryEmojis

// Map category slugs to tagline translation keys
const categoryTaglineKeys: Record<string, string> = {
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
  tech: 'tech',
  'transport-service': 'transportService',
  'cleaning-services': 'cleaningServices',
  childcare: 'childcare',
  'grocery-stores': 'groceryStores',
  'handyman-services': 'handymanServices',
};

export default function DirectoryPage() {
  const searchParams = useSearchParams();
  // const { language } = useLanguage();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const t = useTranslations();

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Entrance animations
  useGSAP(() => {
    const timeline = gsap.timeline({
      defaults: {
        ease: ANIMATION_DEFAULTS.ease.entrance,
      },
    });

    // Header: Fade up
    if (headerRef.current) {
      timeline.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: ANIMATION_DEFAULTS.duration.normal }
      );
    }

    // Search bar: Scale up with elastic bounce
    if (searchBarRef.current) {
      timeline.fromTo(
        searchBarRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: ANIMATION_DEFAULTS.duration.normal,
          ease: ANIMATION_DEFAULTS.ease.elastic,
        },
        '-=0.4' // Overlap for smoother flow
      );
    }
  }, []);

  // Scroll-triggered card animations
  useEffect(() => {
    if (loading || professionals.length === 0 || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.professional-card');
    
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
      once: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [loading, professionals]);

  // Read URL query parameters on mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('q');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories', {
          cache: 'force-cache', // Categories are stable, cache aggressively
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);

        // Use AbortController for timeout
        // Mobile networks need longer timeout (up to 30 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`/api/professionals?${params}`, {
          signal: controller.signal,
          cache: 'force-cache',
          next: { revalidate: 300 },
        });
        clearTimeout(timeoutId);

        const data = await response.json();

        console.log('[Directory] API response:', { 
          success: data.success, 
          hasDataData: !!data.data?.data,
          isDataArray: Array.isArray(data.data),
          dataLength: Array.isArray(data.data) ? data.data.length : (data.data?.data?.length || 0)
        });

        if (data.success && data.data.data) {
          setProfessionals(Array.isArray(data.data.data) ? data.data.data : []);
        } else if (data.success && Array.isArray(data.data)) {
          setProfessionals(data.data);
        } else {
          console.warn('[Directory] Unexpected API response structure:', data);
          setProfessionals([]);
        }
      } catch (error) {
        console.error('[Directory] Failed to fetch professionals:', error);
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);


  const [gridColumns, setGridColumns] = useState('auto 1fr auto');
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setGridColumns(window.innerWidth < 768 ? '1fr' : 'auto 1fr auto');
    };
    handleResize(); // Set on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show floating back button on mobile after scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setShowBackButton(window.scrollY > 300);
      } else {
        setShowBackButton(false);
      }
    };
    
    handleScroll(); // Check on mount
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div style={{ padding: '3rem 1rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Back to Homepage Link */}
        {selectedCategory && (
          <div style={{ marginBottom: '2rem' }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#2563eb',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {t.directory.back}
            </a>
          </div>
        )}

        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t.directory.title}</h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            {t.directory.subtitle}
          </p>
          
          {/* Category Tagline - Display when category is selected */}
          {selectedCategory && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderLeft: '4px solid #2563eb',
              borderRadius: '0.375rem'
            }}>
              <p style={{
                fontSize: '1rem',
                color: '#1f2937',
                fontWeight: '500',
                margin: 0
              }}>
                {t.categoryTaglines?.[categoryTaglineKeys[selectedCategory] as keyof typeof t.categoryTaglines] || ''}
              </p>
            </div>
          )}
        </div>

        {/* Search & Filter */}
        <div
          ref={searchBarRef}
          style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '0.5rem',
          padding: '2rem',
          marginBottom: '3rem',
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: '1rem',
          alignItems: 'flex-end',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
        }}>
          {/* Search Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}>
            <input
              type="text"
              placeholder={`🔍 ${t.directory.searchPlaceholder}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                color: '#1f2937',
                backgroundColor: '#fafafa',
                transition: 'all 0.3s ease',
                fontWeight: '500',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px' }}>
            <CategorySelect
              categories={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder={t.directory.allCategories}
            />
          </div>

          {/* Clear/Search Button */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                {t.directory.clearBtn} ✕
              </button>
            )}
            <button
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #000000 100%)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🔎 {t.directory.searchBtn}
            </button>
          </div>
        </div>

        {/* Quick Register Button */}
        {!isAuthenticated && (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button
              onClick={handleRegisterClick}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
              }}
            >
              {t.directory.registerProfessional}
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: '3rem', height: '3rem', border: '2px solid #2563eb', borderBottomColor: 'transparent', borderRadius: '50%' }} />
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>{t.directory.loading}</p>
          </div>
        ) : professionals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', backgroundColor: '#f3f4f6', borderRadius: '0.5rem' }}>
            <p style={{ color: '#6b7280' }}>{t.directory.noResults}</p>
          </div>
        ) : (
          <div
            ref={gridRef}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
          >
            {professionals.map((prof) => (
              <a key={prof._id} href={`/professionals/${prof.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="professional-card" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', transition: 'transform 0.2s, boxShadow 0.2s', cursor: 'pointer' }}>
                  {(prof.images?.[0] || prof.gallery?.[0]) ? (
                    <div style={{ width: '100%', aspectRatio: '1.5', overflow: 'hidden', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <AppImage
                        src={prof.images?.[0] || prof.gallery?.[0] || ''}
                        alt={prof.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="w-full h-full"
                        objectFit="cover"
                        objectPosition="center"
                      />
                    </div>
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '1.5', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      📷 No image
                    </div>
                  )}
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{prof.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {prof.description}
                    </p>
                    {prof.location?.city && (
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                        📍 {prof.location.city}
                      </p>
                    )}
                    {prof.rating && (
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        ⭐ {prof.rating}/5 ({prof.reviewCount} reviews)
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Floating Back to Home Button - Mobile Only */}
      {showBackButton && (
        <a
          href="/"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '2rem',
            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
            fontWeight: '600',
            fontSize: '0.95rem',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            animation: 'slideUp 0.3s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
            e.currentTarget.style.transform = 'translateX(-50%) translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateX(-50%) translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.4)';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🏠</span>
          Back to Home
        </a>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          // Auth state will be updated via useAuth hook's polling
        }}
      />
    </div>
  );
}

/**
 * Directory page - browse professionals
 */

'use client';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/hooks/useLanguage';
import { getCategoryNameTranslation } from '@/lib/utils/category-translation';

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
  tech: '💻',
  'transport-service': '🚗',
  'cleaning-services': '🧹',
  childcare: '👶',
  'grocery-stores': '🛒',
  'handyman-services': '🔧',
};

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
  const { language } = useLanguage();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const t = useTranslations();

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

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
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

        const response = await fetch(`/api/professionals?${params}`);
        const data = await response.json();

        if (data.success && data.data.data) {
          setProfessionals(Array.isArray(data.data.data) ? data.data.data : []);
        } else if (data.success && Array.isArray(data.data)) {
          setProfessionals(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch professionals:', error);
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

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
        <div style={{ marginBottom: '3rem' }}>
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
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '0.5rem',
          padding: '2rem',
          marginBottom: '3rem',
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'auto 1fr auto',
          gap: '1rem',
          alignItems: 'flex-end',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
          border: '1px solid rgba(229, 231, 235, 0.5)',
        }}>
          {/* Search Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: '#1f2937',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Name, skills..."
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
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: '#1f2937',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              ✨ Service
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.95rem',
                color: selectedCategory ? '#1f2937' : '#9ca3af',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '500',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%231f2937' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                paddingRight: '2rem',
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
            >
              <option value="">All Services</option>
              {categories.map((category) => (
                <option key={category._id} value={category.slug}>
                  {categoryEmojis[category.slug] || '•'} {getCategoryNameTranslation(category.slug, language as 'en' | 'fr')}
                </option>
              ))}
            </select>
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
                Clear ✕
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
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              🔎 Search
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {professionals.map((prof) => (
              <a key={prof._id} href={`/professionals/${prof.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', transition: 'transform 0.2s, boxShadow 0.2s', cursor: 'pointer' }}>
                  {prof.images && prof.images[0] && (
                    <div style={{ width: '100%', aspectRatio: '1.5', overflow: 'hidden', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={prof.images[0]}
                        alt={prof.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}{!prof.images || !prof.images[0] && (
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthenticated(true)}
      />
    </div>
  );
}

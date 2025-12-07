/**
 * Directory page - browse professionals
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthModal } from '@/components/AuthModal';
import { useTranslations } from '@/hooks/useTranslations';

export default function DirectoryPage() {
  const searchParams = useSearchParams();
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
        params.append('sort', sortBy);
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
  }, [searchTerm, selectedCategory, sortBy]);

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
              ← Back to Homepage
            </a>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t.directory.title}</h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            {t.directory.subtitle}
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <input
            type="text"
            placeholder={t.directory.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              gridColumn: 'span 2',
              padding: '0.625rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.625rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          >
            <option value="">{t.directory.allCategories}</option>
            {categories.map((category) => (
              <option key={category._id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
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
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading...</p>
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

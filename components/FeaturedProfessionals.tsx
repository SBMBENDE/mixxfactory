'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface Professional {
  _id: string;
  name: string;
  slug: string;
  photo?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  rating: number;
  reviewCount: number;
  featured: boolean;
  priceFrom?: number;
  tier?: 'free' | 'featured' | 'boost';
}

// Skeleton Loader
function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: '0.75rem',
        overflow: 'hidden',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        height: '360px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image skeleton */}
      <div
        style={{
          height: '200px',
          backgroundColor: '#f3f4f6',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Content skeleton */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div
          style={{
            height: '1rem',
            backgroundColor: '#e5e7eb',
            borderRadius: '0.25rem',
            width: '70%',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <div
          style={{
            height: '0.75rem',
            backgroundColor: '#e5e7eb',
            borderRadius: '0.25rem',
            width: '50%',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
        <div style={{ flex: 1 }} />
        <div
          style={{
            height: '2.5rem',
            backgroundColor: '#e5e7eb',
            borderRadius: '0.25rem',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>
    </div>
  );
}

export default function FeaturedProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch featured professionals
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/professionals?sort=rating&limit=8&featured=true');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProfessionals(data.data.slice(0, 8));
        }
      } catch (error) {
        console.error('Failed to fetch featured professionals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const renderRating = (rating: number, reviewCount: number) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#f59e0b',
        }}
      >
        <FontAwesomeIcon icon={faStar} style={{ width: '1rem', height: '1rem' }} />
        <span style={{ fontWeight: '600' }}>{rating.toFixed(1)}</span>
        <span style={{ color: '#9ca3af' }}>({reviewCount})</span>
      </div>
    );
  };

  return (
    <section style={{ padding: '3rem 1rem', backgroundColor: '#f9fafb' }}>
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
          Top-rated professionals
        </h2>

        {/* Grid Container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {loading ? (
            <>
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <SkeletonCard />
                </div>
              ))}
            </>
          ) : professionals.length > 0 ? (
            professionals.map((pro) => (
              <Link
                key={pro._id}
                href={`/professionals/${pro.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
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
                  {/* Badge */}
                  {(pro.featured || pro.tier === 'boost') && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        zIndex: 10,
                        backgroundColor: pro.tier === 'boost' ? '#f59e0b' : '#2563eb',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                      }}
                    >
                      {pro.tier === 'boost' ? '🚀 Boost' : 'Featured'}
                    </div>
                  )}

                  {/* Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#f3f4f6',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {pro.photo ? (
                      <Image
                        src={pro.photo}
                        alt={pro.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 220px"
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          backgroundColor: '#e5e7eb',
                        }}
                      >
                        👤
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Name */}
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        marginBottom: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {pro.name}
                    </h3>

                    {/* Category */}
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {pro.category.name}
                    </p>

                    {/* Rating */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      {renderRating(pro.rating, pro.reviewCount)}
                    </div>

                    {/* Price */}
                    {pro.priceFrom && (
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: '#2563eb',
                          fontWeight: '600',
                          marginBottom: '1rem',
                        }}
                      >
                        From €{pro.priceFrom}
                      </p>
                    )}

                    {/* Button */}
                    <button
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: 'auto',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1d4ed8';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onClick={(e) => {
                        // This will be handled by the Link wrapper
                        e.preventDefault();
                      }}
                    >
                      View profile
                      <FontAwesomeIcon icon={faArrowRight} style={{ width: '0.75rem', height: '0.75rem' }} />
                    </button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '2rem',
                color: '#9ca3af',
              }}
            >
              No professionals found
            </div>
          )}
        </div>

        {/* See All Link */}
        {professionals.length > 0 && (
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <Link
              href="/directory?sort=rating"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#2563eb',
                border: '2px solid #2563eb',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#2563eb';
              }}
            >
              See all professionals
              <FontAwesomeIcon icon={faArrowRight} style={{ width: '1rem', height: '1rem' }} />
            </Link>
          </div>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
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

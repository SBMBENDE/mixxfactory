/**
 * FeaturedProfessionals Server Component
 * Receives data from parent server component
 * Pure rendering - no fetching, no hooks
 */

import Link from 'next/link';
import { AppImage } from '@/components/AppImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface Professional {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
  gallery?: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  category?: string; // Now just an ID string (not populated)
}

interface Props {
  professionals: Professional[];
}

export default function FeaturedProfessionalsServer({ professionals }: Props) {
  if (!professionals || professionals.length === 0) {
    return null;
  }

  return (
    <section style={{
      padding: '4rem 1rem',
      backgroundColor: 'white',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#1f2937',
          }}>
            Top-Rated Professionals
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '1rem',
          }}>
            Discover top-rated professionals in your area
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          <style>{`
            .professional-card {
              text-decoration: none;
              color: inherit;
              border-radius: 0.75rem;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              transition: transform 0.2s, box-shadow 0.2s;
              display: block;
            }
            .professional-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 10px 15px rgba(0,0,0,0.15);
            }
          `}</style>
          {professionals.slice(0, 4).map((professional) => (
            <Link
              key={professional._id}
              href={`/professionals/${professional.slug}`}
              className="professional-card"
            >
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}>
                {/* Image */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: '#f3f4f6',
                  overflow: 'hidden',
                }}>
                  {(professional.images?.[0] || professional.gallery?.[0]) ? (
                    <AppImage
                      src={professional.images?.[0] || professional.gallery?.[0] || ''}
                      alt={professional.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="w-full h-full"
                      objectFit="cover"
                      priority={false}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                    }}>
                      👤
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{
                  padding: '1rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Featured Badge */}
                  {professional.featured && (
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      width: 'fit-content',
                    }}>
                      ⭐ FEATURED
                    </span>
                  )}

                  {/* Name */}
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    color: '#1f2937',
                    lineHeight: '1.3',
                  }}>
                    {professional.name}
                  </h3>

                  {/* Rating */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: 'auto',
                    fontSize: '0.875rem',
                    color: '#f59e0b',
                  }}>
                    <FontAwesomeIcon icon={faStar} style={{ width: '1rem', height: '1rem' }} />
                    <span>{professional.rating.toFixed(1)}</span>
                    <span style={{ color: '#9ca3af' }}>
                      ({professional.reviewCount})
                    </span>
                  </div>

                  {/* CTA */}
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: '#2563eb',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}>
                    View Profile
                    <FontAwesomeIcon icon={faArrowRight} style={{ width: '0.75rem', height: '0.75rem' }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/directory"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'background-color 0.2s',
            }}
            className="browse-btn"
          >
            Browse All Professionals
          </Link>
        </div>
      </div>
      <style>{`
        .browse-btn:hover {
          background-color: #1d4ed8;
        }
      `}</style>
    </section>
  );
}

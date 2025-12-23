/**
 * Professional Detail Client Component
 * Displays professional profile with edit button for authenticated users
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faGlobe, faMapPin } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTwitter, faFacebook, faYoutube, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import ImageGallery from './ImageGallery';

interface Professional {
  _id: string;
  userId?: string;
  name: string;
  slug: string;
  description: string;
  email?: string;
  phone?: string;
  website?: string;
  images: string[];
  gallery?: string[];
  bio?: string;
  verified?: boolean;
  category?: {
    _id: string;
    name: string;
  };
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  featured?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

interface Props {
  professional: Professional;
}

export default function ProfessionalDetailClient({ professional }: Props) {
  const { user } = useAuth();
  const t = useTranslations();
  const [isOwner, setIsOwner] = useState(false);

  // Check if the current user owns this profile
  useEffect(() => {
    if (user && professional.userId && user.userId === professional.userId) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [user, professional.userId]);

  return (
    <div style={{ padding: '3rem 1rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Back to Directory Link */}
        <div style={{ marginBottom: '2rem' }}>
          <a
            href="/directory"
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
            ← {t.detail.backToDirectory}
          </a>
        </div>

        {/* Profile Picture & Gallery Section */}
        {professional.images && professional.images.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <ImageGallery
              images={professional.images}
              title={`${professional.name} Gallery`}
              isAdmin={false}
            />
          </div>
        )}

        {/* Info Section with Edit Button */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{professional.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {professional.category && (
                  <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    {professional.category.name}
                  </span>
                )}
                {professional.featured && (
                  <span style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    ⭐ Featured
                  </span>
                )}
                {professional.verified && (
                  <span style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
            {isOwner && (
              <Link href={`/professionals/${professional.slug}/edit`}>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.2s',
                }}>
                  ✏️ Edit Profile
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t.detail.about}</h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151' }}>
            {professional.description}
          </p>
        </div>

        {/* Bio Section - if available */}
        {professional.bio && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Bio</h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap' }}>
              {professional.bio}
            </p>
          </div>
        )}

        {/* Pricing Info */}
        {professional.priceRange && (professional.priceRange.min !== undefined && professional.priceRange.min > 0 || professional.priceRange.max !== undefined && professional.priceRange.max > 0) && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t.detail.pricing}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {professional.priceRange.min !== undefined && professional.priceRange.min > 0 && (
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t.detail.minimumPrice}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>€{professional.priceRange.min}</p>
                </div>
              )}
              {professional.priceRange.max !== undefined && professional.priceRange.max > 0 && (
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{t.detail.maximumPrice}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>€{professional.priceRange.max}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information - Icons Only */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{t.detail.contact}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            {professional.email && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={`mailto:${professional.email}`}
                  title={`Email: ${professional.email}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    color: '#000000',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <FontAwesomeIcon icon={faEnvelope} size="2x" />
                </a>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#111827' }}>Email</span>
              </div>
            )}
            {professional.phone && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={`tel:${professional.phone}`}
                  title={`Phone: ${professional.phone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    color: '#000000',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <FontAwesomeIcon icon={faPhone} size="2x" />
                </a>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#111827' }}>Phone</span>
              </div>
            )}
            {professional.website && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={professional.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Website: ${professional.website}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    color: '#000000',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <FontAwesomeIcon icon={faGlobe} size="2x" />
                </a>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#111827' }}>Website</span>
              </div>
            )}
            {professional.location?.city && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  title={`Location: ${professional.location.city}${professional.location.region ? ', ' + professional.location.region : ''}${professional.location.country ? ', ' + professional.location.country : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    color: '#000000',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                  }}
                >
                  <FontAwesomeIcon icon={faMapPin} size="2x" />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#111827' }}>Location</span>
              </div>
            )}
          </div>
        </div>

        {/* Social Media Links */}
        {professional.socialLinks && (professional.socialLinks.instagram || professional.socialLinks.twitter || professional.socialLinks.facebook || professional.socialLinks.youtube || professional.socialLinks.tiktok) && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{t.detail.followUs}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {professional.socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${professional.socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#E4405F',
                    color: 'white',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title="Instagram"
                >
                  <FontAwesomeIcon icon={faInstagram} size="lg" />
                </a>
              )}
              {professional.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${professional.socialLinks.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#1DA1F2',
                    color: 'white',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title="Twitter"
                >
                  <FontAwesomeIcon icon={faTwitter} size="lg" />
                </a>
              )}
              {professional.socialLinks.facebook && (
                <a
                  href={`https://facebook.com/${professional.socialLinks.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#1877F2',
                    color: 'white',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title="Facebook"
                >
                  <FontAwesomeIcon icon={faFacebook} size="lg" />
                </a>
              )}
              {professional.socialLinks.youtube && (
                <a
                  href={`https://youtube.com/${professional.socialLinks.youtube.startsWith('@') ? 'c/' : ''}${professional.socialLinks.youtube.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#FF0000',
                    color: 'white',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title="YouTube"
                >
                  <FontAwesomeIcon icon={faYoutube} size="lg" />
                </a>
              )}
              {professional.socialLinks.tiktok && (
                <a
                  href={`https://tiktok.com/@${professional.socialLinks.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#000000',
                    color: 'white',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  title="TikTok"
                >
                  <FontAwesomeIcon icon={faTiktok} size="lg" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}>
            Contact Now
          </button>
          <button style={{
            backgroundColor: 'transparent',
            color: '#3b82f6',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontWeight: '500',
            border: '2px solid #3b82f6',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            Share
          </button>
        </div>

        {/* Portfolio Gallery Section */}
        {professional.gallery && professional.gallery.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Portfolio Gallery</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {professional.gallery.map((image, index) => (
                  <a
                    key={index}
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '0.5rem',
                      backgroundColor: '#f3f4f6',
                      aspectRatio: '1',
                    }}
                  >
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1)';
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <ReviewsList professionalId={professional._id} />
          <ReviewForm professionalId={professional._id} />
        </div>
      </div>
    </div>
  );
}

/**
 * Professional Detail Client Component
 * Displays professional profile with edit button for authenticated users
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppImage } from './AppImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faGlobe, faMapPin, faTimes, faCrown } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faTwitter, faFacebook, faYoutube, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedDescription, getLocalizedBio } from '@/utils/localization';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import ImageGallery from './ImageGallery';
import AvailabilityCalendar from './AvailabilityCalendar';
import { hasFeatureAccess } from '@/lib/utils/tier-access';
import { AuthModal } from './AuthModal';
import type { Professional } from '@/types';

interface Props {
  professional: Professional;
}

export default function ProfessionalDetailClient({ professional }: Props) {
  const { user } = useAuth();
  const t = useTranslations();
  const { language } = useLanguage();
  const [isOwner, setIsOwner] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Get localized content
  const localizedDescription = getLocalizedDescription(professional, language);
  const localizedBio = getLocalizedBio(professional as any, language);
  
  // Ensure categories is a Record<string, string> for type safety
  const categories: Record<string, string> = t.categories as Record<string, string>;
  
  // Check tier access for contact info and social links
  const canShowContactInfo = hasFeatureAccess(professional.subscriptionTier as any, 'contactInfo');
  const canShowSocialLinks = hasFeatureAccess(professional.subscriptionTier as any, 'socialLinksPublic');
  
  // Determine how many images to show based on tier (for both profile images and gallery)
  const getVisibleImages = (imageArray: string[]) => {
    const tier = professional.subscriptionTier || 'free';
    
    if (tier === 'free') return imageArray.slice(0, 1); // Only 1 image for free tier
    if (tier === 'starter') return imageArray.slice(0, 5); // 5 images for starter
    return imageArray; // Unlimited for pro
  };

  const visibleProfileImages = getVisibleImages(professional.images || []);
  const visibleGallery = getVisibleImages(professional.gallery || []);
  const hasMoreProfileImages = (professional.images || []).length > visibleProfileImages.length;
  const hasMoreGalleryImages = (professional.gallery || []).length > visibleGallery.length;

  // Handle restricted actions
  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canShowContactInfo) {
      setModalMessage('This professional is on a Free plan and has not enabled public contact information. They need to upgrade to Starter or Pro to display contact details.');
      setShowUpgradeModal(true);
    } else if (professional.email) {
      // Open email client with professional's email
      window.location.href = `mailto:${professional.email}`;
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!canShowSocialLinks) {
      setModalMessage('This professional is on a Free plan and social sharing is not available. They need to upgrade to Starter or Pro to enable this feature.');
      setShowUpgradeModal(true);
      return;
    }
    
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: professional.name,
        text: `Check out ${professional.name} on Afrobizz!`,
        url: url,
      }).catch(() => {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // Check if the current user owns this profile
  useEffect(() => {
    if (user && professional.userId && user.userId === professional.userId) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [user, professional.userId]);

  // Listen for auth modal open events from ReviewForm
  useEffect(() => {
    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuthModal);
  }, []);

  // Listen for auth modal open events from ReviewForm
  useEffect(() => {
    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuthModal);
  }, []);

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
        {visibleProfileImages && visibleProfileImages.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <ImageGallery
              images={visibleProfileImages}
              title={`${professional.name} Gallery`}
              isAdmin={false}
            />
            {hasMoreProfileImages && (
              <div style={{ 
                marginTop: '1rem',
                padding: '1.5rem',
                backgroundColor: isOwner ? '#fef3c7' : '#f3f4f6',
                borderRadius: '0.75rem',
                textAlign: 'center',
              }}>
                {isOwner ? (
                  <>
                    {professional.subscriptionTier === 'free' ? (
                      <>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#92400e', marginBottom: '0.75rem' }}>
                          {t.tierMessages?.freeOwnerTitle || 'Want to showcase your full gallery?'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '1rem' }}>
                          {t.tierMessages?.freeOwnerDesc || 'Premium professionals showcase their full gallery and get more exposure on MixxFactory.'}
                        </p>
                        <Link
                          href="/checkout"
                          style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                          }}
                        >
                          {t.tierMessages?.freeOwnerButton || '👑 Unlock Premium Features'}
                        </Link>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>
                          {t.tierMessages?.starterOwnerTitle || '🚀 Want Unlimited Gallery?'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#1e3a8a', marginBottom: '1rem' }}>
                          {t.tierMessages?.starterOwnerDesc || 'Upgrade to Pro for unlimited gallery images and maximum exposure!'}
                        </p>
                        <Link
                          href="/checkout?tier=pro"
                          style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                          }}
                        >
                          {t.tierMessages?.starterOwnerButton || '⚡ Upgrade to Pro'}
                        </Link>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {professional.subscriptionTier === 'free' ? (
                      <>
                        <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                          {t.tierMessages?.freeVisitorTitle || 'Want to see more?'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                          {t.tierMessages?.freeVisitorDesc || 'Premium professionals showcase their full gallery and get more exposure on MixxFactory.'}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#d1d5db', marginTop: '0.5rem', fontStyle: 'italic' }}>
                          {t.tierMessages?.freeVisitorNote || 'Limited preview • This professional has chosen the Free plan with limited display'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                          {t.tierMessages?.starterVisitorTitle || 'More images available'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                          {(t.tierMessages?.starterVisitorDescProfile || 'This professional is on the Starter plan. Showing {current} of {total} images.')
                            .replace('{current}', visibleProfileImages.length.toString())
                            .replace('{total}', (professional.images?.length || 0).toString())}
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
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
                    {(() => {
                      // Accept both with and without slug property for compatibility
                      const cat: any = professional.category;
                      const slug = (typeof cat.slug === 'string' && cat.slug)
                        || (typeof cat.name === 'string' && cat.name.toLowerCase().replace(/\s+/g, '-'))
                        || '';
                      if (slug && categories && Object.prototype.hasOwnProperty.call(categories, slug)) {
                        return categories[slug];
                      }
                      return cat.name;
                    })()}
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
                  ✏️ {t.common?.editProfile || 'Edit Profile'}
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t.detail.about}</h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151' }}>
            {localizedDescription}
          </p>
        </div>

        {/* Bio Section - if available */}
        {localizedBio && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Bio</h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap' }}>
              {localizedBio}
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
        {canShowContactInfo && (professional.email || professional.phone || professional.website || professional.location?.city) && (
        <div data-section="contact" style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
        )}

        {/* Social Media Links */}
        {canShowSocialLinks && professional.socialLinks && (professional.socialLinks.instagram || professional.socialLinks.twitter || professional.socialLinks.facebook || professional.socialLinks.youtube || professional.socialLinks.tiktok) && (
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
          <button 
            onClick={handleContactClick}
            disabled={!canShowContactInfo}
            style={{
              backgroundColor: canShowContactInfo ? '#3b82f6' : '#9ca3af',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              border: 'none',
              cursor: canShowContactInfo ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s',
              opacity: canShowContactInfo ? 1 : 0.6,
            }}
          >
            {canShowContactInfo ? (t.common?.contactNow || 'Contact Now') : `🔒 ${t.common?.contactUpgradeRequired || 'Contact (Upgrade Required)'}`}
          </button>
          <button 
            onClick={handleShareClick}
            disabled={!canShowSocialLinks}
            style={{
              backgroundColor: 'transparent',
              color: canShowSocialLinks ? '#3b82f6' : '#9ca3af',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              border: `2px solid ${canShowSocialLinks ? '#3b82f6' : '#9ca3af'}`,
              cursor: canShowSocialLinks ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: canShowSocialLinks ? 1 : 0.6,
            }}
          >
            {canShowSocialLinks ? (t.common?.share || 'Share') : `🔒 ${t.common?.shareUpgradeRequired || 'Share'}`}
          </button>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div 
            onClick={() => setShowUpgradeModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <FontAwesomeIcon 
                  icon={faCrown} 
                  style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '1rem' }} 
                />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                  Feature Not Available
                </h2>
              </div>
              
              <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151', marginBottom: '1.5rem', textAlign: 'center' }}>
                {modalMessage}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Got It
                </button>
                <Link
                  href="/pricing"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Gallery Section */}
        {visibleGallery && visibleGallery.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Portfolio Gallery</h2>
                {hasMoreGalleryImages && !isOwner && (
                  <span style={{ 
                    fontSize: '0.875rem', 
                    color: '#9ca3af',
                    backgroundColor: '#f9fafb',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontWeight: '500',
                  }}>
                    Limited preview
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {visibleGallery.map((image, index) => (
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
                    <AppImage
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="w-full h-full object-cover transition-transform duration-200"
                      objectFit="cover"
                      objectPosition="center"
                      priority={false}
                    />
                  </a>
                ))}
              </div>
              {hasMoreGalleryImages && (
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1.5rem', 
                  backgroundColor: isOwner ? '#fef3c7' : '#f9fafb',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                }}>
                  {isOwner ? (
                    <>
                      {professional.subscriptionTier === 'free' ? (
                        <>
                          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#92400e', marginBottom: '0.75rem' }}>
                            {t.tierMessages?.freeVisitorTitle || 'Want to see more?'}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '1rem' }}>
                            {t.tierMessages?.freeOwnerDesc || 'Premium professionals showcase their full gallery and get more exposure on Afrobizz.'}
                          </p>
                          <Link
                            href="/checkout"
                            style={{
                              display: 'inline-block',
                              padding: '0.75rem 1.5rem',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              textDecoration: 'none',
                            }}
                          >
                            {t.tierMessages?.freeOwnerButton || '👑 Unlock Premium Features'}
                          </Link>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>
                            {t.tierMessages?.starterGalleryOwnerTitle || '🚀 Go Pro for Unlimited'}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#1e3a8a', marginBottom: '1rem' }}>
                            {t.tierMessages?.starterGalleryOwnerDesc || 'Upgrade to Pro for unlimited gallery images and maximum exposure!'}
                          </p>
                          <Link
                            href="/checkout?tier=pro"
                            style={{
                              display: 'inline-block',
                              padding: '0.75rem 1.5rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              borderRadius: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              textDecoration: 'none',
                            }}
                          >
                            {t.tierMessages?.starterOwnerButton || '⚡ Upgrade to Pro'}
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {professional.subscriptionTier === 'free' ? (
                        <>
                          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                            {t.tierMessages?.freeVisitorTitle || 'Want to see more?'}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                            {t.tierMessages?.freeVisitorDesc || 'Premium professionals showcase their full gallery and get more exposure on Afrobizz.'}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: '#d1d5db', marginTop: '0.5rem', fontStyle: 'italic' }}>
                            {t.tierMessages?.freeVisitorNote || 'Limited preview • This professional has chosen the Free plan with limited display'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                            {t.tierMessages?.starterVisitorTitle || 'More images available'}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                            {t.tierMessages?.starterVisitorDescGallery || 'This professional is on the Starter plan with limited gallery display.'}
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Calendar Section - Pro only */}
        {professional.subscriptionTier === 'pro' && professional.availability && Object.keys(professional.availability).length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <AvailabilityCalendar
              availability={professional.availability}
              readOnly={true}
              subscriptionTier={professional.subscriptionTier}
            />
          </div>
        )}

        {/* Reviews Section */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <ReviewsList professionalId={professional._id} />
          <ReviewForm professionalId={professional._id} />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          window.location.reload(); // Reload to show review form
        }}
      />
    </div>
  );
}

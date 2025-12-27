

"use client";
/**
 * Professional Profile Management Page
 */


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faEye, faCheckCircle, faExclamationTriangle, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import ImageUpload from '@/components/ImageUpload';
import GalleryUpload from '@/components/GalleryUpload';
import Image from 'next/image';

interface ProfileData {
  _id: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  verified: boolean;
  subscriptionTier: string;
  images: string[];
  gallery: string[];
  category: {
    name: string;
  };
  location: {
    city: string;
    region: string;
    country: string;
  };
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
}


export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialLinks, setSocialLinks] = useState<ProfileData['socialLinks']>({});
  const [savingSocial, setSavingSocial] = useState(false);
  const [socialError, setSocialError] = useState('');


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/professional/my-profile', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.data);
          setGallery(data.data.gallery || []);
          setSocialLinks(data.data.socialLinks || {});
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#6b7280' }}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#dc2626' }}>Profile not found</div>
      </div>
    );
  }

  const completionFields = [
    { label: 'Basic Info', complete: !!(profile.name && profile.description) },
    { label: 'Contact Info', complete: !!(profile.email && profile.phone) },
    { label: 'Location', complete: !!(profile.location?.city) },
    { label: 'Images', complete: profile.images && profile.images.length > 0 },
    { label: 'Social Links', complete: !!(profile.socialLinks?.instagram || profile.socialLinks?.facebook) },
  ];

  const completedCount = completionFields.filter(f => f.complete).length;
  const completionPercentage = (completedCount / completionFields.length) * 100;

  // Handle image upload (profile images)
  const handleImagesAdded = (newImages: string[]) => {
    if (!profile) return;
    setProfile({ ...profile, images: [...(profile.images || []), ...newImages] });
  };

  // Handle gallery update
  const handleGalleryUpdated = (newGallery: string[]) => {
    setGallery(newGallery);
    if (profile) setProfile({ ...profile, gallery: newGallery });
  };

  // Social links handlers
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialLinks({ ...socialLinks, [e.target.name]: e.target.value });
  };

  const handleSaveSocial = async () => {
    if (!profile) return;
    setSavingSocial(true);
    setSocialError('');
    try {
      const res = await fetch(`/api/admin/professionals/${profile._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ socialLinks }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update social links');
      }
      setProfile({ ...profile, socialLinks });
      setEditingSocial(false);
    } catch (err: any) {
      setSocialError(err.message || 'Failed to update social links');
    } finally {
      setSavingSocial(false);
    }
  };

  const handleCancelSocial = () => {
    setSocialLinks(profile?.socialLinks || {});
    setEditingSocial(false);
    setSocialError('');
  };

  return (
    <div>
            {/* Profile Image Upload */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Profile Images</h2>
              {profile && (
                <ImageUpload
                  professionalId={profile._id}
                  onImagesAdded={handleImagesAdded}
                />
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                {profile?.images?.map((img, idx) => (
                  <Image
                    key={img}
                    src={img}
                    alt={`Profile ${idx + 1}`}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                    sizes="80px"
                    priority={idx === 0}
                  />
                ))}
              </div>
            </div>

            {/* Gallery Upload */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Gallery Images</h2>
              <GalleryUpload
                gallery={gallery}
                onGalleryUpdated={handleGalleryUpdated}
              />
            </div>

            {/* Social Links Edit */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Social Links</h2>
              {!editingSocial ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  {['instagram', 'twitter', 'facebook', 'youtube', 'tiktok'].map((key) => (
                    socialLinks[key as keyof typeof socialLinks] ? (
                      <a
                        key={key}
                        href={
                          key === 'instagram' ? `https://instagram.com/${socialLinks[key as keyof typeof socialLinks]?.replace('@', '')}` :
                          key === 'twitter' ? `https://twitter.com/${socialLinks[key as keyof typeof socialLinks]?.replace('@', '')}` :
                          key === 'facebook' ? `https://facebook.com/${socialLinks[key as keyof typeof socialLinks]}` :
                          key === 'youtube' ? `https://youtube.com/${socialLinks[key as keyof typeof socialLinks]}` :
                          key === 'tiktok' ? `https://tiktok.com/@${socialLinks[key as keyof typeof socialLinks]?.replace('@', '')}` : '#'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'underline', color: '#2563eb', marginRight: 8 }}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </a>
                    ) : null
                  ))}
                  <button onClick={() => setEditingSocial(true)} style={{ marginLeft: 8, background: '#f3f4f6', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); handleSaveSocial(); }} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  {['instagram', 'twitter', 'facebook', 'youtube', 'tiktok'].map((key) => (
                    <input
                      key={key}
                      name={key}
                      value={socialLinks[key as keyof typeof socialLinks] || ''}
                      onChange={handleSocialChange}
                      placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                      style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4, minWidth: 120 }}
                      disabled={savingSocial}
                    />
                  ))}
                  <button type="submit" disabled={savingSocial} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 500, cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faSave} /> Save
                  </button>
                  <button type="button" onClick={handleCancelSocial} disabled={savingSocial} style={{ background: '#f3f4f6', color: '#111', border: 'none', borderRadius: 4, padding: '6px 14px', fontWeight: 500, cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faTimes} /> Cancel
                  </button>
                  {socialError && <span style={{ color: '#dc2626', marginLeft: 8 }}>{socialError}</span>}
                </form>
              )}
            </div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          My Profile
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage your professional profile and public information
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link
          href={`/professionals/${profile.slug}/edit`}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FontAwesomeIcon icon={faEdit} />
          Edit Profile
        </Link>
        <Link
          href={`/professionals/${profile.slug}`}
          target="_blank"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'white',
            color: '#2563eb',
            border: '1px solid #2563eb',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FontAwesomeIcon icon={faEye} />
          View Public Profile
        </Link>
      </div>

      {/* Profile Completion */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Profile Completion
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              {completedCount} of {completionFields.length} sections complete
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2563eb' }}>
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '0.5rem',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${completionPercentage}%`,
                height: '100%',
                backgroundColor: '#2563eb',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {completionFields.map((field, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                backgroundColor: field.complete ? '#dcfce7' : '#fef3c7',
                borderRadius: '0.375rem',
              }}
            >
              <FontAwesomeIcon
                icon={field.complete ? faCheckCircle : faExclamationTriangle}
                style={{ color: field.complete ? '#15803d' : '#92400e' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                {field.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Overview */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Profile Overview
        </h2>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Name:</span>
            <span>{profile.name}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Category:</span>
            <span>{profile.category.name}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Location:</span>
            <span>
              {profile.location?.city && profile.location?.country
                ? `${profile.location.city}, ${profile.location.country}`
                : 'Not specified'}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Email:</span>
            <span>{profile.email || 'Not specified'}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Phone:</span>
            <span>{profile.phone || 'Not specified'}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Website:</span>
            <span>{profile.website || 'Not specified'}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Verified:</span>
            <span>
              {profile.verified ? (
                <span style={{ color: '#15803d', fontWeight: '500' }}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Yes
                </span>
              ) : (
                <span style={{ color: '#dc2626', fontWeight: '500' }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} /> No
                </span>
              )}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Subscription:</span>
            <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
              {profile.subscriptionTier}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
            <span style={{ fontWeight: '600', color: '#6b7280' }}>Profile URL:</span>
            <a
              href={`/professionals/${profile.slug}`}
              target="_blank"
              style={{ color: '#2563eb', textDecoration: 'underline' }}
            >
              mixxfactory.com/professionals/{profile.slug}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

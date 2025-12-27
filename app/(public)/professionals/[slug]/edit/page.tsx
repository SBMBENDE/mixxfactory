/**
 * Professional Profile Edit Page
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppImage } from '@/components/AppImage';
import { useTranslations } from '@/hooks/useTranslations';
import Link from 'next/link';

interface FormData {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  region: string;
  country: string;
  profilePicFile: File | null;
  profilePicPreview: string;
  imageFiles: File[];
  imagePreviews: string[];
  minPrice: number;
  maxPrice: number;
  instagram: string;
  twitter: string;
  facebook: string;
  youtube: string;
  tiktok: string;
}

const INITIAL_FORM = {
  name: '',
  description: '',
  email: '',
  phone: '',
  website: '',
  city: '',
  region: '',
  country: '',
  profilePicFile: null,
  profilePicPreview: '',
  imageFiles: [],
  imagePreviews: [],
  minPrice: 0,
  maxPrice: 0,
  instagram: '',
  twitter: '',
  facebook: '',
  youtube: '',
  tiktok: '',
};

export default function EditProfessionalPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Load professional data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check authentication first
        const authRes = await fetch('/api/auth/me', { 
          credentials: 'include',
          cache: 'no-store',
        });
        if (!authRes.ok) {
          router.push('/auth/login');
          return;
        }

        const authData = await authRes.json();
        const userId = authData.data?.userId;
        console.log('Full auth response:', JSON.stringify(authData, null, 2));
        console.log('Current user ID from auth:', userId, 'Type:', typeof userId);

        // Get professional data by slug
        const res = await fetch(`/api/professionals?slug=${slug}`);
        const data = await res.json();

        console.log('Full professional API response:', JSON.stringify(data, null, 2));

        // The API returns {success, data: {data: [...], total, page, ...}}
        const professionals = data.data?.data || data.data || [];
        if (!Array.isArray(professionals) || professionals.length === 0) {
          console.error('No professional found with slug:', slug);
          setError('Professional profile not found');
          setLoading(false);
          return;
        }

        const professional = professionals[0];
        console.log('Professional data:', JSON.stringify(professional, null, 2));
        console.log('Professional userId:', professional.userId, 'Type:', typeof professional.userId);
        console.log('Professional name:', professional.name);
        console.log('Professional location:', professional.location);
        console.log('Professional socialLinks:', professional.socialLinks);

        // For now, allow any authenticated user to edit if userId is missing
        // This handles legacy data or edge cases
        if (professional.userId && professional.userId !== userId) {
          console.error('Ownership check failed - user does not own this profile', { 
            professionalUserId: professional.userId,
            authUserId: userId,
          });
          setError('You do not have permission to edit this profile');
          setLoading(false);
          return;
        }

        // If we get here, user is either the owner or it's legacy data
        console.log('Ownership check passed - allowing edit');
        

        setIsOwner(true);

        // Populate form with existing data
        console.log('Populating form with:', {
          name: professional.name,
          city: professional.location?.city,
          instagram: professional.socialLinks?.instagram,
        });
        
        setFormData({
          name: professional.name || '',
          description: professional.description || '',
          email: professional.email || '',
          phone: professional.phone || '',
          website: professional.website || '',
          city: professional.location?.city || '',
          region: professional.location?.region || '',
          country: professional.location?.country || '',
          profilePicFile: null,
          profilePicPreview: professional.images?.[0] || '',
          imageFiles: [],
          imagePreviews: professional.images?.slice(1) || [],
          minPrice: professional.priceRange?.min || 0,
          maxPrice: professional.priceRange?.max || 0,
          instagram: professional.socialLinks?.instagram || '',
          twitter: professional.socialLinks?.twitter || '',
          facebook: professional.socialLinks?.facebook || '',
          youtube: professional.socialLinks?.youtube || '',
          tiktok: professional.socialLinks?.tiktok || '',
        });

        console.log('Form data populated');
        setLoading(false);
      } catch (err) {
        console.error('Error loading professional:', err);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    loadData();
  }, [slug, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'profilePicFile' && (e.target as HTMLInputElement).files) {
      const file = (e.target as HTMLInputElement).files![0];
      if (file) {
        handleProfilePicChange(file);
      }
    } else if (name === 'imageFiles' && (e.target as HTMLInputElement).files) {
      const newFiles = Array.from((e.target as HTMLInputElement).files!);
      if (newFiles.length === 0) return;
      processFilesAndAddToGallery(newFiles);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value ? Number(value) : 0) : value,
      }));
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const processFilesAndAddToGallery = async (files: File[]) => {
    const newPreviews: string[] = [];
    
    for (const file of files) {
      try {
        const preview = await readFileAsDataURL(file);
        newPreviews.push(preview);
      } catch (err) {
        console.error('Failed to read file:', err);
      }
    }
    
    if (newPreviews.length > 0) {
      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...files],
        imagePreviews: [...prev.imagePreviews, ...newPreviews],
      }));
    }
    
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 100);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const handleProfilePicChange = async (file: File) => {
    try {
      const preview = await readFileAsDataURL(file);
      setFormData(prev => ({
        ...prev,
        profilePicFile: file,
        profilePicPreview: preview,
      }));
    } catch (err) {
      console.error('Failed to read profile picture:', err);
    }
    setTimeout(() => {
      if (profilePicInputRef.current) {
        profilePicInputRef.current.value = '';
      }
    }, 100);
  };

  const removeProfilePic = () => {
    setFormData(prev => ({
      ...prev,
      profilePicFile: null,
      profilePicPreview: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/professionals/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          images: formData.profilePicPreview 
            ? [formData.profilePicPreview, ...formData.imagePreviews]
            : formData.imagePreviews,
          location: {
            city: formData.city,
            region: formData.region,
            country: formData.country,
          },
          priceRange: {
            min: formData.minPrice,
            max: formData.maxPrice,
          },
          socialLinks: {
            instagram: formData.instagram,
            twitter: formData.twitter,
            facebook: formData.facebook,
            youtube: formData.youtube,
            tiktok: formData.tiktok,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Failed to update profile');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/professionals/${slug}`);
      }, 1500);
    } catch (err) {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (error && !isOwner) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
        <a href="/directory" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>
          Back to Directory
        </a>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>You don&apos;t have permission to edit this profile.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Edit Profile
          </h1>
          <p style={{ color: '#6b7280' }}>
            Update your professional details
          </p>
        </div>

        {/* Back to Dashboard Link */}
        <Link href="/professional" style={{ color: '#2563eb', fontWeight: 500, marginBottom: '1.5rem', display: 'inline-block', fontSize: '1rem' }}>
          ← Back to Dashboard
        </Link>

        {/* Form Container */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {success && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#d1fae5',
              color: '#047857',
              borderRadius: '0.375rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              ✓ Profile updated successfully! Redirecting...
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '0.375rem',
              marginBottom: '1.5rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Basic Information</legend>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Professional Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    minHeight: '120px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </fieldset>

            {/* Contact Info */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Contact Information</legend>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    backgroundColor: '#f3f4f6',
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Email cannot be changed</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </fieldset>

            {/* Location */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Location</legend>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Region/State *
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </fieldset>

            {/* Pricing */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Pricing</legend>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Minimum Price (€)
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={formData.minPrice}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Maximum Price (€)
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={formData.maxPrice}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </fieldset>

            {/* Social Links */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Social Media</legend>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  Instagram Username
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@yourhandle"
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder="@yourhandle"
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Facebook Page
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    placeholder="yourpage"
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    YouTube Channel
                  </label>
                  <input
                    type="text"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleInputChange}
                    placeholder="@yourchannel"
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    TikTok Handle
                  </label>
                  <input
                    type="text"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleInputChange}
                    placeholder="@yourhandle"
                    style={{
                      width: '100%',
                      padding: '0.625rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </fieldset>

            {/* Profile Picture & Gallery Section */}
            {/* Profile Picture */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Profile Picture</legend>
              
              {formData.profilePicPreview && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', width: '150px', aspectRatio: '1', borderRadius: '0.5rem', border: '2px solid #d1d5db', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                    <AppImage
                      src={formData.profilePicPreview}
                      alt="Profile Picture"
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                      objectFit="cover"
                      objectPosition="center"
                      priority={false}
                    />
                    <button
                      type="button"
                      onClick={removeProfilePic}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        backgroundColor: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove profile picture"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  {formData.profilePicPreview ? 'Change Profile Picture' : 'Upload Profile Picture'}
                </label>
                <input
                  ref={profilePicInputRef}
                  type="file"
                  name="profilePicFile"
                  accept="image/*"
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                  }}
                />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Select one image for your profile picture
                </p>
              </div>
            </fieldset>

            {/* Portfolio Gallery */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Portfolio Gallery</legend>
              
              {/* Image Preview Gallery */}
              {formData.imagePreviews.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>Preview ({formData.imagePreviews.length} images):</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {formData.imagePreviews.map((preview, index) => (
                      <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.5rem', border: '2px solid #d1d5db', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                        <AppImage
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                          objectFit="cover"
                          objectPosition="center"
                          priority={false}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: 'rgba(255, 0, 0, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  {formData.imagePreviews.length > 0 ? 'Add More Images' : 'Upload Images'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="imageFiles"
                  accept="image/*"
                  multiple
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.625rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                  }}
                />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  {formData.imagePreviews.length > 0 
                    ? `${t.professional.selectMoreImages} ${formData.imagePreviews.length} ${formData.imagePreviews.length > 1 ? t.professional.uploadedImagesPlural : t.professional.uploadedImages}`
                    : t.professional.selectImagesHelp
                  }
                </p>
              </div>
            </fieldset>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  padding: '0.625rem 1.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.625rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

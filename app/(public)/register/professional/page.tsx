/**
 * Professional Registration Form - Create professional profile after signup
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/hooks/useLanguage';
import { getCategoryNameTranslation } from '@/lib/utils/category-translation';

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

export default function ProfessionalRegistrationPage() {
  const router = useRouter();
  const t = useTranslations();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Check authentication and email verification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const userData = await res.json();
        setIsAuthenticated(true);
        
        // Check if email is verified
        if (userData.data?.emailVerified) {
          setEmailVerified(true);
        } else {
          // Email not verified - redirect to verification page
          router.push('/auth/resend-verification');
          return;
        }
      } catch {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.data) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

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
      
      // Process each file and add to existing images
      processFilesAndAddToGallery(newFiles);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value ? Number(value) : 0) : value,
      }));
    }
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
    
    // Add to existing images
    if (newPreviews.length > 0) {
      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...files],
        imagePreviews: [...prev.imagePreviews, ...newPreviews],
      }));
    }
    
    // Reset the file input after a small delay to allow for re-selection
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 100);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
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
    setLoading(true);

    try {
      // Validate category is selected
      if (!selectedCategoryId) {
        setError('Please select a category');
        setLoading(false);
        return;
      }

      // Create professional profile
      const res = await fetch('/api/admin/professionals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          category: selectedCategoryId,
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
          rating: 5,
          reviewCount: 0,
          featured: false,
          active: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Failed to create profile');
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Redirect to profile page after success
      setTimeout(() => {
        router.push(`/professionals/${data.data.slug}`);
      }, 1500);
    } catch (err) {
      console.error('Professional creation error:', err);
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (!emailVerified) {
    return (
      <div style={{ padding: '3rem 1rem', backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Verify Your Email First</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Please verify your email address before completing your professional profile.
          </p>
          <a
            href="/auth/resend-verification"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Verify Email
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {t.professional.completeProfile}
          </h1>
          <p style={{ color: '#6b7280' }}>
            {t.professional.fillDetails}
          </p>
        </div>

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
              {t.professional.profileCreated}
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
            {/* Category Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                {t.professional.category} *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.625rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">{t.professional.selectCategory}</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {getCategoryNameTranslation(cat.slug, language)}
                  </option>
                ))}
              </select>
              {error === 'Please select a category' && (
                <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {t.professional.selectCategoryError}
                </p>
              )}
            </div>
            {/* Basic Info */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t.professional.basicInfo}</legend>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  {t.professional.name} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t.professional.yourName}
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
                  {t.professional.description} *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t.professional.tellUs}
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
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t.professional.contactInfo}</legend>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  {t.professional.email} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t.professional.yourEmail}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {t.professional.phone}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t.professional.yourPhone}
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
                    {t.professional.website}
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder={t.professional.yourWebsite}
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
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t.professional.location}</legend>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {t.professional.city} *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t.professional.cityName}
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
                    {t.professional.region} *
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder={t.professional.regionName}
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
                  {t.professional.country} *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder={t.professional.countryName}
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
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t.professional.pricing}</legend>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {t.professional.minPrice}
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={formData.minPrice}
                    onChange={handleInputChange}
                    placeholder={t.professional.minPriceExample}
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
                    {t.professional.maxPrice}
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={formData.maxPrice}
                    onChange={handleInputChange}
                    placeholder={t.professional.maxPriceExample}
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
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{t.professional.socialMedia}</legend>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                  {t.professional.instagram}
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder={t.professional.handle}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {t.professional.twitter}
                  </label>
                  <input
                    type="text"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder={t.professional.twitterHandle}
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
                    {t.professional.facebook}
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    placeholder={t.professional.facebookPage}
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
                    {t.professional.youtube}
                  </label>
                  <input
                    type="text"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleInputChange}
                    placeholder={t.professional.youtubeChannel}
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
                    {t.professional.tiktok}
                  </label>
                  <input
                    type="text"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleInputChange}
                    placeholder={t.professional.tiktokHandle}
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

            {/* Profile Picture */}
            <fieldset style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
              <legend style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Profile Picture</legend>
              
              {formData.profilePicPreview && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative', width: '150px', aspectRatio: '1', borderRadius: '0.5rem', border: '2px solid #d1d5db', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                    <img
                      src={formData.profilePicPreview}
                      alt="Profile Picture"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
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
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                          }}
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
                    ? `Select more images to add to your ${formData.imagePreviews.length} uploaded image${formData.imagePreviews.length > 1 ? 's' : ''}`
                    : 'Select one or more images (JPG, PNG, GIF, etc.)'
                  }
                </p>
              </div>
            </fieldset>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                fontWeight: '600',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
              }}
            >
              {loading ? t.professional.creating : t.professional.createProfile}
            </button>

            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
              {t.professional.requiredFields}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

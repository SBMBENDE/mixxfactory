/**
 * Promote Your Event page - Event submission form with pricing tiers
 */

'use client';

import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { validateVideoUrl } from '@/utils/videoValidation';

interface EventFormData {
  title: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: {
    venue: string;
    city: string;
    region: string;
    address: string;
    country: string;
  };
  posterImage: string;
  bannerImage: string;
  images: Array<{
    url: string;
    caption: string;
    order: number;
  }>;
  capacity: number;
  ticketing: Array<{
    label: string;
    price: number;
    currency: string;
  }>;
  ticketUrl: string;
  organizer: {
    name: string;
    email: string;
    phone: string;
    website: string;
  };
  highlights: string[];
  media: Array<{
    url: string;
    platform: 'youtube' | 'facebook' | 'vimeo';
    videoId: string;
    embedUrl: string;
  }>;
  pricingTier: 'free' | 'featured' | 'boost';
}

const PRICING_TIERS = [
  {
    id: 'free',
    name: '🆓 Free Listing',
    description: 'Basic event listing',
    price: 0,
    imageLimit: 1,
    videoLimit: 0,
    features: [
      'Basic event profile',
      'Search visibility',
      '1 image',
      'Contact information',
    ],
  },
  {
    id: 'featured',
    name: '⭐ Featured Event',
    description: 'Premium visibility',
    pricePerWeek: 25,
    price: 25,
    duration: 'per week',
    imageLimit: 5,
    videoLimit: 1,
    features: [
      'Everything in Free',
      'Featured on homepage',
      'Top search results',
      'Event badge',
      'Up to 5 images',
      '1 video embed',
      'Social media promotion',
    ],
  },
  {
    id: 'boost',
    name: '🚀 Boost Pack',
    description: 'Maximum exposure',
    price: 99,
    duration: 'per month',
    imageLimit: 10,
    videoLimit: 3,
    features: [
      'Everything in Featured',
      'Homepage banner',
      'News Flash inclusion',
      'Priority support',
      'Up to 10 images',
      'Up to 3 videos',
      'Analytics dashboard',
      'Extended duration (30 days)',
    ],
  },
];

export default function PromoteEventPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'free' | 'featured' | 'boost'>('free');
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    category: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '19:00',
    endTime: '23:59',
    location: {
      venue: '',
      city: '',
      region: '',
      address: '',
      country: '',
    },
    posterImage: '',
    bannerImage: '',
    images: [],
    capacity: 0,
    ticketing: [
      { label: 'General', price: 0, currency: 'EUR' },
    ],
    ticketUrl: '',
    organizer: {
      name: '',
      email: '',
      phone: '',
      website: '',
    },
    highlights: [],
    media: [],
    pricingTier: 'free',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authentication
  useEffect(() => {
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

  // Event categories (hardcoded to match admin dashboard)
  const eventCategories = [
    'Music',
    'Sports',
    'Theater',
    'Comedy',
    'Conferences',
    'Festivals',
    'Exhibitions',
    'Workshops',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [key]: value }
      }));
    } else if (name.startsWith('organizer.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        organizer: { ...prev.organizer, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title || !formData.category || !formData.startDate || !formData.description) {
        setError('Please fill in title, category, start date, and description');
        setLoading(false);
        return;
      }

      if (!formData.location.venue) {
        setError('Please fill in the venue name');
        setLoading(false);
        return;
      }

      if (!formData.capacity || formData.capacity <= 0) {
        setError('Please enter a valid capacity');
        setLoading(false);
        return;
      }

      if (!formData.organizer.name) {
        setError('Please enter organizer name');
        setLoading(false);
        return;
      }

      if (!formData.posterImage) {
        setError('Please upload a poster image');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        pricingTier: selectedTier,
        published: true,
      };

      console.log('Submitting event data:', submitData);

      const res = await fetch('/api/promote-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      console.log('API response:', data);

      if (data.success) {
        setSuccess('Event submitted successfully!');
        setFormData({
          title: '',
          category: '',
          description: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          location: { venue: '', city: '', region: '', address: '', country: '' },
          posterImage: '',
          bannerImage: '',
          images: [],
          media: [],
          capacity: 0,
          ticketing: [{ label: 'General', price: 0, currency: 'EUR' }],
          ticketUrl: '',
          organizer: { name: '', email: '', phone: '', website: '' },
          highlights: [],
          pricingTier: 'free',
        });
        // Redirect after 2 seconds
        setTimeout(() => window.location.href = '/events', 2000);
      } else {
        setError(data.error || data.message || 'Failed to submit event');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(`Error: ${errorMsg}`);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <section style={{
          paddingTop: '4rem',
          paddingBottom: '4rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #ec4899 100%)',
          color: 'white',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Promote Your Event
            </h1>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: '#f0f9ff' }}>
              You must be registered to promote your events.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'white',
                color: '#7c3aed',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Register or Login
            </button>
          </div>
        </section>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section style={{
        paddingTop: '4rem',
        paddingBottom: '4rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #ec4899 100%)',
        color: 'white',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Promote Your Event
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#f0f9ff', marginBottom: '2rem' }}>
            Get your event in front of thousands of attendees
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section style={{ padding: '4rem 1rem', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center', color: '#1f2937' }}>
            Choose Your Plan
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem',
          }}>
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id as 'free' | 'featured' | 'boost')}
                style={{
                  padding: '2rem',
                  backgroundColor: selectedTier === tier.id ? '#2563eb' : 'white',
                  color: selectedTier === tier.id ? 'white' : '#1f2937',
                  borderRadius: '0.75rem',
                  border: selectedTier === tier.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  if (selectedTier !== tier.id) {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTier !== tier.id) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {tier.name}
                </h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                  {tier.description}
                </p>
                <div style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  €{tier.price}
                  {tier.duration && <span style={{ fontSize: '0.875rem', opacity: 0.8 }}> {tier.duration}</span>}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 'auto', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
                  {tier.features.map((feature, idx) => (
                    <li key={idx} style={{ fontSize: '0.9rem', paddingLeft: '1.5rem', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0 }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Submission Form */}
      <section style={{ padding: '4rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
            Event Details
          </h2>

          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select a category</option>
                {eventCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* End Date & Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Venue Name *
              </label>
              <input
                type="text"
                name="location.venue"
                value={formData.location.venue}
                onChange={handleInputChange}
                placeholder="Event venue or location"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* City, Region & Country */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Region
                </label>
                <input
                  type="text"
                  name="location.region"
                  value={formData.location.region}
                  onChange={handleInputChange}
                  placeholder="Region/State"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Country
                </label>
                <input
                  type="text"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Full Address
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                placeholder="Street address"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Image Gallery */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', marginTop: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Event Gallery</h3>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {formData.images.length} / {PRICING_TIERS.find(t => t.id === selectedTier)?.imageLimit || 1} images
                </span>
              </div>

              {/* Upload New Image */}
              {formData.images.length < (PRICING_TIERS.find(t => t.id === selectedTier)?.imageLimit || 1) && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Add Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const newImage = {
                            url: reader.result as string,
                            caption: '',
                            order: formData.images.length,
                          };
                          setFormData(prev => ({
                            ...prev,
                            images: [...prev.images, newImage],
                            posterImage: prev.posterImage || (reader.result as string), // Set as poster if first image
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px dashed #d1d5db',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              )}

              {/* Image Gallery Display */}
              {formData.images.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '1rem',
                }}>
                  {formData.images.map((image, index) => (
                    <div key={index} style={{
                      position: 'relative',
                      borderRadius: '0.375rem',
                      overflow: 'hidden',
                      backgroundColor: '#e5e7eb',
                      aspectRatio: '1',
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={`Gallery ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0 0 0 0.375rem',
                      }}>
                        <button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index),
                            }));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: 0,
                          }}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                      {index === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          left: '0.5rem',
                          backgroundColor: 'rgb(249, 115, 22)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}>
                          Featured
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  backgroundColor: 'white',
                  borderRadius: '0.375rem',
                  border: '1px dashed #d1d5db',
                }}>
                  <p>No images added yet. Add images to showcase your event.</p>
                </div>
              )}
            </div>

            {/* Video Gallery Section */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb',
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Event Videos</h3>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {formData.media.length} / {PRICING_TIERS.find(t => t.id === selectedTier)?.videoLimit || 0} videos
                </span>
              </div>

              {/* Add Video URL */}
              {formData.media.length < (PRICING_TIERS.find(t => t.id === selectedTier)?.videoLimit || 0) && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Add Video (YouTube, Facebook, or Vimeo)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                    <input
                      type="url"
                      id="videoUrl"
                      placeholder="Paste YouTube, Facebook, or Vimeo link..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '1rem',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const videoInput = document.getElementById('videoUrl') as HTMLInputElement;
                        if (videoInput?.value) {
                          const videoData = validateVideoUrl(videoInput.value);
                          
                          if (videoData) {
                            setFormData(prev => ({
                              ...prev,
                              media: [...prev.media, videoData],
                            }));
                            videoInput.value = '';
                          } else {
                            alert('Invalid video URL. Please use YouTube, Facebook, or Vimeo links.');
                          }
                        }
                      }}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Add Video
                    </button>
                  </div>
                </div>
              )}

              {/* Video Gallery Display */}
              {formData.media.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '1rem',
                }}>
                  {formData.media.map((video, index) => (
                    <div key={index} style={{
                      position: 'relative',
                      borderRadius: '0.375rem',
                      overflow: 'hidden',
                      backgroundColor: '#1f2937',
                      aspectRatio: '16/9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                    }}>
                      {video.platform === 'youtube' && '▶'}
                      {video.platform === 'facebook' && '📘'}
                      {video.platform === 'vimeo' && '▶'}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0 0 0 0.375rem',
                      }}>
                        <button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              media: prev.media.filter((_, i) => i !== index),
                            }));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: 0,
                          }}
                          title="Remove video"
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        backgroundColor: 'rgb(249, 115, 22)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                      }}>
                        {video.platform}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.media.length === 0 && (PRICING_TIERS.find(t => t.id === selectedTier)?.videoLimit || 0) > 0 && (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  backgroundColor: 'white',
                  borderRadius: '0.375rem',
                  border: '1px dashed #d1d5db',
                }}>
                  <p>No videos added yet. Add videos to showcase your event.</p>
                </div>
              )}
            </div>

            {/* Poster & Banner Images (Legacy - kept for backward compatibility) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Poster Image (Legacy)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, posterImage: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
                {formData.posterImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.posterImage}
                    alt="Poster Preview"
                    style={{
                      marginTop: '0.5rem',
                      maxWidth: '100%',
                      maxHeight: '150px',
                      borderRadius: '0.375rem',
                    }}
                  />
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  Banner Image (Legacy)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData(prev => ({ ...prev, bannerImage: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
                {formData.bannerImage && (
                  <img
                    src={formData.bannerImage}
                    alt="Banner Preview"
                    style={{
                      marginTop: '0.5rem',
                      maxWidth: '100%',
                      maxHeight: '100px',
                      borderRadius: '0.375rem',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Ticket URL */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Ticket Purchase URL
              </label>
              <input
                type="url"
                name="ticketUrl"
                value={formData.ticketUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/tickets"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Organizer Info */}
            <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', marginTop: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #2563eb' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>Organizer Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Organizer Name
                  </label>
                  <input
                    type="text"
                    name="organizer.name"
                    value={formData.organizer.name}
                    onChange={handleInputChange}
                    placeholder="Organization name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="organizer.email"
                    value={formData.organizer.email}
                    onChange={handleInputChange}
                    placeholder="contact@example.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="organizer.phone"
                    value={formData.organizer.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    name="organizer.website"
                    value={formData.organizer.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event"
                rows={6}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Capacity */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Expected Attendees/Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Number of attendees"
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Selected Plan Summary */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem',
              marginTop: '1rem',
            }}>
              <p style={{ color: '#374151', marginBottom: '0.5rem' }}>
                <strong>Selected Plan:</strong> {PRICING_TIERS.find(t => t.id === selectedTier)?.name}
              </p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                €{PRICING_TIERS.find(t => t.id === selectedTier)?.price} {PRICING_TIERS.find(t => t.id === selectedTier)?.duration}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '1rem',
                backgroundColor: loading ? '#d1d5db' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              {loading ? 'Submitting...' : 'Promote Event'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

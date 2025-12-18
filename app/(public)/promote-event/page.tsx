/**
 * Promote Your Event page - Event submission form with pricing tiers
 */

'use client';

import { useState, useEffect } from 'react';
import { AuthModal } from '@/components/AuthModal';

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
  };
  posterImage: string;
  capacity: number;
  pricingTier: 'free' | 'featured' | 'boost';
}

const PRICING_TIERS = [
  {
    id: 'free',
    name: '🆓 Free Listing',
    description: 'Basic event listing',
    price: 0,
    features: [
      'Basic event profile',
      'Search visibility',
      'Up to 5 photos',
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
    features: [
      'Everything in Free',
      'Featured on homepage',
      'Top search results',
      'Event badge',
      'Social media promotion',
    ],
  },
  {
    id: 'boost',
    name: '🚀 Boost Pack',
    description: 'Maximum exposure',
    price: 99,
    duration: 'per month',
    features: [
      'Everything in Featured',
      'Homepage banner',
      'News Flash inclusion',
      'Priority support',
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
    startTime: '',
    endTime: '',
    location: {
      venue: '',
      city: '',
      region: '',
    },
    posterImage: '',
    capacity: 0,
    pricingTier: 'free',
  });
  const [categories, setCategories] = useState<any[]>([]);
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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, posterImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title || !formData.category || !formData.startDate) {
        setError('Please fill in all required fields');
        return;
      }

      const submitData = {
        ...formData,
        pricingTier: selectedTier,
      };

      const res = await fetch('/api/admin/professionals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

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
          location: { venue: '', city: '', region: '' },
          posterImage: '',
          capacity: 0,
          pricingTier: 'free',
        });
        // Redirect after 2 seconds
        setTimeout(() => window.location.href = '/events', 2000);
      } else {
        setError(data.message || 'Failed to submit event');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
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
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
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

            {/* City & Region */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            </div>

            {/* Capacity */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Expected Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Expected number of attendees"
                min="0"
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

            {/* Poster Image */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Event Poster Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
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
                <img
                  src={formData.posterImage}
                  alt="Preview"
                  style={{
                    marginTop: '1rem',
                    maxWidth: '200px',
                    borderRadius: '0.375rem',
                  }}
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event"
                rows={6}
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

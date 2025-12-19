/**
 * Edit Event page - Modify existing event details
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface LocationData {
  venue: string;
  city: string;
  region: string;
  address: string;
  country: string;
}

interface OrganizerData {
  name: string;
  email: string;
  phone: string;
  website: string;
}

interface TicketingData {
  label: string;
  price: number;
  currency: string;
}

interface ImageData {
  url: string;
  caption: string;
  order: number;
}

interface EventFormData {
  title: string;
  category: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: LocationData;
  posterImage: string;
  bannerImage: string;
  images: ImageData[];
  capacity: number;
  ticketing: TicketingData[];
  ticketUrl: string;
  organizer: OrganizerData;
  highlights: string[];
}

const EVENT_CATEGORIES = [
  'Music',
  'Sports',
  'Theater',
  'Comedy',
  'Conferences',
  'Festivals',
  'Exhibitions',
  'Workshops',
];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

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
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [posterPreview, setPosterPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${eventId}`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (data.success) {
          const event = data.data;
          setFormData({
            title: event.title || '',
            category: event.category || '',
            description: event.description || '',
            startDate: event.startDate?.split('T')[0] || '',
            endDate: event.endDate?.split('T')[0] || '',
            startTime: event.startTime || '19:00',
            endTime: event.endTime || '23:59',
            location: event.location || {
              venue: '',
              city: '',
              region: '',
              address: '',
              country: '',
            },
            posterImage: event.posterImage || '',
            bannerImage: event.bannerImage || '',
            images: event.images || [],
            capacity: event.capacity || 0,
            ticketing: event.ticketing || [{ label: 'General', price: 0, currency: 'EUR' }],
            ticketUrl: event.ticketUrl || '',
            organizer: event.organizer || {
              name: '',
              email: '',
              phone: '',
              website: '',
            },
            highlights: event.highlights || [],
          });
          if (event.posterImage) setPosterPreview(event.posterImage);
          if (event.bannerImage) setBannerPreview(event.bannerImage);
        } else {
          setError(data.error || 'Failed to load event');
        }
      } catch (err) {
        setError('Error loading event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      // Handle nested object properties (e.g., "location.city")
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof EventFormData] as any,
          [child]: value,
        },
      }));
    } else if (name === 'capacity') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'poster' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({
          ...prev,
          [imageType === 'poster' ? 'posterImage' : 'bannerImage']: base64,
        }));
        if (imageType === 'poster') {
          setPosterPreview(base64);
        } else {
          setBannerPreview(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTicketingChange = (index: number, field: string, value: string | number) => {
    const newTicketing = [...formData.ticketing];
    if (field === 'price') {
      newTicketing[index].price = parseFloat(value as string) || 0;
    } else {
      (newTicketing[index] as any)[field] = value;
    }
    setFormData(prev => ({
      ...prev,
      ticketing: newTicketing,
    }));
  };

  const handleHighlightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const highlights = e.target.value.split(',').map(h => h.trim()).filter(h => h);
    setFormData(prev => ({
      ...prev,
      highlights,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title) {
      setError('Event title is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }
    if (!formData.description) {
      setError('Description is required');
      return;
    }
    if (!formData.location.venue) {
      setError('Venue is required');
      return;
    }
    if (formData.capacity <= 0) {
      setError('Capacity must be greater than 0');
      return;
    }
    if (!formData.organizer.name) {
      setError('Organizer name is required');
      return;
    }
    if (!formData.posterImage) {
      setError('Poster image is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Event updated successfully!');
        setTimeout(() => {
          router.push('/my-events');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update event');
      }
    } catch (err) {
      setError('Error updating event');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section style={{ padding: '2rem', textAlign: 'center', minHeight: '80vh' }}>
        <p>Loading event...</p>
      </section>
    );
  }

  return (
    <section style={{ padding: '2rem 1rem', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#1f2937' }}>
          Edit Event
        </h1>

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '0.375rem',
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
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          {/* Basic Information */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
            Basic Information
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select a category</option>
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Date & Time */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem', color: '#1f2937' }}>
            Date & Time
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
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
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
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
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
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
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Location */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem', color: '#1f2937' }}>
            Location
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Venue Name
            </label>
            <input
              type="text"
              name="location.venue"
              value={formData.location.venue}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
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
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                City
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Region
              </label>
              <input
                type="text"
                name="location.region"
                value={formData.location.region}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Country
              </label>
              <input
                type="text"
                name="location.country"
                value={formData.location.country}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Media */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem', color: '#1f2937' }}>
            Event Gallery
          </h2>

          {/* Image Gallery */}
          <div style={{ padding: '1.5rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', marginBottom: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Gallery Images</h3>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {formData.images.length} images
              </span>
            </div>

            {/* Upload New Image */}
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
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Poster Image (Legacy)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'poster')}
              style={{ marginBottom: '0.5rem' }}
            />
            {posterPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterPreview}
                alt="Poster preview"
                style={{ width: '100%', maxWidth: '300px', borderRadius: '0.375rem' }}
              />
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Banner Image (Legacy)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'banner')}
              style={{ marginBottom: '0.5rem' }}
            />
            {bannerPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerPreview}
                alt="Banner preview"
                style={{ width: '100%', maxWidth: '100%', borderRadius: '0.375rem' }}
              />
            )}
          </div>

          {/* Ticketing */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem', color: '#1f2937' }}>
            Ticketing
          </h2>

          {formData.ticketing.map((ticket, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Ticket Label
                </label>
                <input
                  type="text"
                  value={ticket.label}
                  onChange={(e) => handleTicketingChange(index, 'label', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ticket.price}
                  onChange={(e) => handleTicketingChange(index, 'price', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                  Currency
                </label>
                <select
                  value={ticket.currency}
                  onChange={(e) => handleTicketingChange(index, 'currency', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          ))}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Ticket URL
            </label>
            <input
              type="url"
              name="ticketUrl"
              value={formData.ticketUrl}
              onChange={handleInputChange}
              placeholder="https://ticketing-platform.com/event"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Organizer */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem', color: '#1f2937' }}>
            Organizer Information
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Organizer Name
            </label>
            <input
              type="text"
              name="organizer.name"
              value={formData.organizer.name}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Email
              </label>
              <input
                type="email"
                name="organizer.email"
                value={formData.organizer.email}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Phone
              </label>
              <input
                type="tel"
                name="organizer.phone"
                value={formData.organizer.phone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Website
            </label>
            <input
              type="url"
              name="organizer.website"
              value={formData.organizer.website}
              onChange={handleInputChange}
              placeholder="https://organizer-website.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Capacity & Highlights */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem', color: '#1f2937' }}>
            Additional Details
          </h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Expected Attendees / Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Highlights (comma-separated)
            </label>
            <input
              type="text"
              value={formData.highlights.join(', ')}
              onChange={handleHighlightsChange}
              placeholder="Live Band, Food Court, VIP Lounge"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: submitting ? '#d1d5db' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

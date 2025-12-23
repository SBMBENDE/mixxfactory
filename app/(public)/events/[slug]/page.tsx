/**
 * Event Detail Page - View full event information
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AppImage } from '@/components/AppImage';

interface EventData {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
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
  bannerImage?: string;
  images?: Array<{
    url: string;
    caption?: string;
    order: number;
  }>;
  media?: string[];
  capacity: number;
  attendees: number;
  ticketing: Array<{
    label: string;
    price: number;
    currency: string;
  }>;
  ticketUrl?: string;
  organizer: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  highlights: string[];
  featured: boolean;
  createdAt: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${slug}`);
        const data = await res.json();

        if (data.success) {
          setEvent(data.data);
        } else {
          setError(data.error || 'Event not found');
        }
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getImageGallery = () => {
    if (event?.images && event.images.length > 0) {
      return event.images.sort((a, b) => a.order - b.order);
    }
    return event?.posterImage ? [{ url: event.posterImage, order: 0 }] : [];
  };

  if (loading) {
    return (
      <section style={{ padding: '2rem', textAlign: 'center', minHeight: '80vh' }}>
        <p>Loading event...</p>
      </section>
    );
  }

  if (error || !event) {
    return (
      <section style={{ padding: '2rem', textAlign: 'center', minHeight: '80vh' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
          Event Not Found
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error || 'This event could not be found.'}</p>
        <Link
          href="/events"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Back to Events
        </Link>
      </section>
    );
  }

  const gallery = getImageGallery();

  return (
    <>
      {/* Hero Section with Image */}
      <section style={{
        position: 'relative',
        backgroundColor: '#1f2937',
        minHeight: isMobile ? '300px' : '500px',
        overflow: 'hidden',
      }}>
        {gallery.length > 0 && (
          <>
            <div
              style={{
                position: 'relative',
                backgroundColor: '#1f2937',
                minHeight: isMobile ? '300px' : '500px',
                overflow: 'hidden',
              }}
            >
              <AppImage
                src={gallery[currentImageIndex].url}
                alt={event.title}
                fill
                sizes="100vw"
                className="w-full h-full"
                objectFit="cover"
                priority={true}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.4)',
                }}
              />

            {/* Image Navigation */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === 0 ? gallery.length - 1 : i - 1))}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === gallery.length - 1 ? 0 : i + 1))}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  →
                </button>

                {/* Image Indicators */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '0.5rem',
                    zIndex: 10,
                  }}
                >
                  {gallery.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
            </div>
          </>
        )}

        {/* Hero Content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '2rem 1rem',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            color: 'white',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <h1 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {event.title}
            </h1>
            <p style={{ fontSize: isMobile ? '0.95rem' : '1.125rem', color: '#f0f9ff' }}>
              {event.category} • {formatDate(event.startDate)}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '2rem 1rem', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '2rem' }}>
            {/* Left Column */}
            <div>
              {/* Description */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  About This Event
                </h2>
                <p style={{ color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {event.description}
                </p>
              </div>

              {/* Highlights */}
              {event.highlights && event.highlights.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                    Highlights
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {event.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          backgroundColor: 'white',
                          borderRadius: '0.375rem',
                          borderLeft: '4px solid #2563eb',
                          color: '#374151',
                        }}
                      >
                        ✓ {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Location */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  Location
                </h2>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.375rem' }}>
                  <p style={{ marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
                    📍 {event.location.venue}
                  </p>
                  <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
                    {event.location.address}
                  </p>
                  <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
                    {event.location.city}, {event.location.region}
                  </p>
                  <p style={{ color: '#6b7280' }}>
                    {event.location.country}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  Date & Time
                </h2>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.375rem' }}>
                  <p style={{ marginBottom: '0.75rem', color: '#1f2937' }}>
                    <strong>Starts:</strong> {formatDate(event.startDate)} at {event.startTime}
                  </p>
                  <p style={{ color: '#1f2937' }}>
                    <strong>Ends:</strong> {formatDate(event.endDate)} at {event.endTime}
                  </p>
                </div>
              </div>

              {/* Videos */}
              {event.media && event.media.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                    Event Videos
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem',
                  }}>
                    {event.media.map((embedUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '0.375rem',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                          {/* YouTube Embed */}
                          {embedUrl?.includes('youtube.com') && (
                            // eslint-disable-next-line jsx-a11y/iframe-has-title
                            <iframe
                              src={embedUrl}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                              }}
                              allowFullScreen
                            />
                          )}
                          {/* Vimeo Embed */}
                          {embedUrl?.includes('vimeo.com') && (
                            // eslint-disable-next-line jsx-a11y/iframe-has-title
                            <iframe
                              src={embedUrl}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                              }}
                              allowFullScreen
                            />
                          )}
                          {/* Facebook Embed */}
                          {embedUrl?.includes('facebook.com') && (
                            // eslint-disable-next-line jsx-a11y/iframe-has-title
                            <iframe
                              src={embedUrl}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                              }}
                              allowFullScreen
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizer */}
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                  Organizer
                </h2>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.375rem' }}>
                  <p style={{ marginBottom: '0.75rem', color: '#1f2937', fontWeight: '600' }}>
                    {event.organizer.name}
                  </p>
                  {event.organizer.phone && (
                    <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
                      📞 {event.organizer.phone}
                    </p>
                  )}
                  {event.organizer.email && (
                    <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
                      📧 {event.organizer.email}
                    </p>
                  )}
                  {event.organizer.website && (
                    <p style={{ color: '#2563eb' }}>
                      <a href={event.organizer.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                        🌐 Visit Website
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div>
              {/* Ticket Info */}
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  padding: '2rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  position: 'sticky',
                  top: '1rem',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                  Event Info
                </h3>

                {/* Capacity */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Capacity
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                    {event.capacity}
                  </p>
                </div>

                {/* Attendees */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Current Attendees
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                    {event.attendees}
                  </p>
                </div>

                {/* Ticketing */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                    Tickets
                  </h4>
                  {event.ticketing.map((ticket, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#6b7280' }}>{ticket.label}</span>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>
                        {ticket.currency} {ticket.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Get Tickets Button */}
                {event.ticketUrl ? (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'rgb(249, 115, 22)',
                      color: 'white',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      border: 'none',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(234, 88, 12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(249, 115, 22)';
                    }}
                  >
                    Get Tickets
                  </a>
                ) : (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: '#d1d5db',
                      color: '#6b7280',
                      borderRadius: '0.375rem',
                      fontWeight: '600',
                      border: 'none',
                      fontSize: '1rem',
                      cursor: 'not-allowed',
                    }}
                  >
                    Tickets Not Available
                  </button>
                )}

                {/* Back to Events */}
                <Link
                  href="/events"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem',
                    marginTop: '1rem',
                    backgroundColor: '#e5e7eb',
                    color: '#1f2937',
                    borderRadius: '0.375rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }}
                >
                  Back to Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

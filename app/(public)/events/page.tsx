/**
 * Events page - Discover upcoming events
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/hooks/useLanguage';

interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  location: {
    city: string;
    region: string;
    venue: string;
  };
  posterImage: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  category: string;
  ticketing: {
    general: number;
    vip?: number;
    ticketUrl?: string;
  };
  capacity: number;
  attendees: number;
  featured: boolean;
  highlights: string[];
}

export default function EventsPage() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams();
        if (showFeaturedOnly) params.append('featured', 'true');

        const res = await fetch(`/api/events?${params}`);
        const data = await res.json();

        if (data.success) {
          setEvents(Array.isArray(data.data.events) ? data.data.events : []);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [showFeaturedOnly]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return language === 'en'
      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ padding: '3rem 1rem', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937',
          }}>
            {t.events.title}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '2rem' }}>
            {t.events.subtitle}
          </p>

          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}>
            <button
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: showFeaturedOnly ? '#2563eb' : '#e5e7eb',
                color: showFeaturedOnly ? 'white' : '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!showFeaturedOnly) {
                  e.currentTarget.style.backgroundColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (!showFeaturedOnly) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
            >
              ⭐ {t.events.featured}
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>{t.events.noEvents}</p>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>{t.events.noEvents}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {events.map((event) => (
              <div
                key={event._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  target.style.transform = 'translateY(-4px)';
                  target.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
              >
                {/* Poster Image */}
                <div style={{
                  position: 'relative',
                  paddingBottom: '133.33%',
                  backgroundColor: '#f3f4f6',
                  overflow: 'hidden',
                }}>
                  <img
                    src={event.posterImage}
                    alt={event.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {event.featured && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: '#fbbf24',
                      color: '#1f2937',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                    }}>
                      ⭐ Featured
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: 0,
                    lineHeight: '1.4',
                  }}>
                    {event.title}
                  </h3>

                  {/* Date & Time */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    color: '#6b7280',
                  }}>
                    <span>📅 {formatDate(event.startDate)}</span>
                    <span>🕐 {event.startTime}</span>
                  </div>

                  {/* Location */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#6b7280',
                  }}>
                    <span>📍</span>
                    <div>
                      <div style={{ fontWeight: '600', color: '#374151' }}>{event.location.venue}</div>
                      <div>{event.location.city}, {event.location.region}</div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}>
                    <div style={{ color: '#2563eb' }}>
                      {t.events.general}: ${event.ticketing.general}
                    </div>
                    {event.ticketing.vip && (
                      <div style={{ color: '#d97706' }}>
                        {t.events.vip}: ${event.ticketing.vip}
                      </div>
                    )}
                  </div>

                  {/* Capacity */}
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#9ca3af',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #e5e7eb',
                  }}>
                    👥 {event.attendees}/{event.capacity} {t.events.attendees}
                  </div>

                  {/* CTA */}
                  <a
                    href={event.ticketing.ticketUrl || `#event-${event._id}`}
                    target={event.ticketing.ticketUrl ? '_blank' : '_self'}
                    rel={event.ticketing.ticketUrl ? 'noopener noreferrer' : ''}
                    style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      textAlign: 'center',
                      borderRadius: '0.375rem',
                      fontWeight: '600',
                      textDecoration: 'none',
                      transition: 'background-color 0.3s ease',
                      marginTop: 'auto',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }}
                  >
                    🎟️ {t.events.buyTickets}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

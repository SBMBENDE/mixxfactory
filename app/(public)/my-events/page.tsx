/**
 * My Events page - User's submitted events with upgrade options
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppImage } from '@/components/AppImage';

interface PromotionTier {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

const PRICING_TIERS: PromotionTier[] = [
  {
    id: 'free',
    name: '🆓 Free Listing',
    price: 0,
    duration: 'forever',
    features: ['Basic event profile', 'Search visibility', 'Contact info'],
  },
  {
    id: 'featured',
    name: '⭐ Featured Event',
    price: 25,
    duration: '/week',
    features: ['Everything in Free', 'Homepage visibility', 'Top results', 'Event badge'],
  },
  {
    id: 'boost',
    name: '🚀 Boost Pack',
    price: 99,
    duration: '/month',
    features: ['Everything in Featured', 'Homepage banner', 'News flash', 'Priority support'],
  },
];

interface Event {
  _id: string;
  title: string;
  slug: string;
  category: string;
  startDate: string;
  promotionTier: string;
  promotionExpiryDate?: string;
  createdAt: string;
  posterImage?: string;
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMyEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/events/my-events?page=${page}&limit=10`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        setEvents(data.data.events);
        setTotal(data.data.pagination.total);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError('Error fetching events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeTier = async (eventId: string, newTier: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/upgrade-tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newTier }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local state
        setEvents(events.map(e => e._id === eventId ? { ...e, promotionTier: newTier } : e));
        setUpgradeDialogOpen(false);
        alert(`Event upgraded to ${newTier} tier successfully!`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error upgrading tier');
      console.error(err);
    }
  };

  const getTierInfo = (tier: string) => {
    return PRICING_TIERS.find(t => t.id === tier);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <section style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading your events...</p>
      </section>
    );
  }

  return (
    <>
      <section style={{ padding: '2rem 1rem', minHeight: '80vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
            My Events
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

          {events.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              backgroundColor: 'white',
              borderRadius: '0.375rem',
            }}>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                You haven&apos;t submitted any events yet.
              </p>
              <Link href="/promote-event" style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '600',
              }}>
                Promote Your Event
              </Link>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}>
                {events.map((event) => {
                  const tierInfo = getTierInfo(event.promotionTier);
                  return (
                    <div
                      key={event._id}
                      style={{
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        borderRadius: '0.375rem',
                        border: '1px solid #e5e7eb',
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr auto',
                        gap: '1.5rem',
                        alignItems: 'start',
                      }}
                    >
                      {/* Event Thumbnail */}
                      {event.posterImage && (
                        <div style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '0.375rem',
                          overflow: 'hidden',
                          backgroundColor: '#e5e7eb',
                          flexShrink: 0,
                          position: 'relative',
                        }}>
                          <AppImage
                            src={event.posterImage}
                            alt={event.title}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover"
                            objectFit="cover"
                            priority={false}
                          />
                        </div>
                      )}

                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
                          {event.title}
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
                          {event.category} • {formatDate(event.startDate)}
                        </p>
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          marginBottom: '1rem',
                        }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: tierInfo?.id === 'free' ? '#d1d5db' : tierInfo?.id === 'featured' ? '#dbeafe' : '#fce7f3',
                            color: tierInfo?.id === 'free' ? '#374151' : tierInfo?.id === 'featured' ? '#1e40af' : '#be185d',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                          }}>
                            {tierInfo?.name}
                          </span>
                          {event.promotionExpiryDate && (
                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                              Expires: {formatDate(event.promotionExpiryDate)}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <Link href={`/my-events/${event._id}/edit`} style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                          }}>
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedEventId(event._id);
                              setUpgradeDialogOpen(true);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            ⭐ Upgrade Tier
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {Math.ceil(total / 10) > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: page === 1 ? '#d1d5db' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: '0.5rem 1rem' }}>
                    Page {page} of {Math.ceil(total / 10)}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / 10)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: page >= Math.ceil(total / 10) ? '#d1d5db' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: page >= Math.ceil(total / 10) ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Back to Events Button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <Link href="/events" style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#1f2937',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                }}>
                  ← Back to Events
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Upgrade Tier Modal */}
      {upgradeDialogOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1f2937' }}>
              Upgrade Your Event
            </h2>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              {PRICING_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    if (selectedEventId) {
                      handleUpgradeTier(selectedEventId, tier.id);
                    }
                  }}
                  style={{
                    padding: '1.5rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>
                      {tier.name}
                    </h3>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb' }}>
                      €{tier.price}{tier.duration}
                    </span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {tier.features.map((feature, idx) => (
                      <li key={idx} style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        ✓ {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <button
              onClick={() => setUpgradeDialogOpen(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
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
        </div>
      )}
    </>
  );
}

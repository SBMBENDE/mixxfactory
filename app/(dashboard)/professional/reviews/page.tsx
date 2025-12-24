/**
 * Professional Reviews Management Page
 */

'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faFilter } from '@fortawesome/free-solid-svg-icons';

interface Review {
  _id: string;
  clientName: string;
  clientEmail: string;
  rating: number;
  title: string;
  comment: string;
  approved: boolean;
  verified: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/professional/reviews?filter=${filter}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#15803d';
    if (rating >= 3.5) return '#d97706';
    return '#dc2626';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#6b7280' }}>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Reviews Management
        </h1>
        <p style={{ color: '#6b7280' }}>
          View and manage your customer reviews
        </p>
      </div>

      {/* Stats Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Reviews</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Average Rating</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: getRatingColor(stats.averageRating) }}>
            {stats.averageRating.toFixed(1)} ⭐
          </p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Approved</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d' }}>{stats.approved}</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Pending Approval</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>{stats.pending}</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          <FontAwesomeIcon icon={faFilter} style={{ marginRight: '0.5rem' }} />
          Filter Reviews
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          <option value="all">All Reviews ({stats.total})</option>
          <option value="approved">Approved ({stats.approved})</option>
          <option value="pending">Pending ({stats.pending})</option>
        </select>
      </div>

      {/* Reviews List */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {reviews.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>
            No reviews to display
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.map((review) => (
              <div
                key={review._id}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: review.approved ? 'white' : '#fef3c7',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{review.clientName}</p>
                      {review.verified && (
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                          }}
                        >
                          <FontAwesomeIcon icon={faCheck} style={{ marginRight: '0.25rem' }} />
                          Verified
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ color: '#d97706', fontSize: '1.25rem' }}>
                      {'⭐'.repeat(review.rating)}
                    </div>
                    {!review.approved && (
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  {review.title}
                </h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6' }}>{review.comment}</p>

                {/* Note for pending */}
                {!review.approved && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      backgroundColor: '#fffbeb',
                      borderLeft: '3px solid #f59e0b',
                      fontSize: '0.875rem',
                      color: '#92400e',
                    }}
                  >
                    ℹ️ This review is awaiting admin approval before being published on your profile
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

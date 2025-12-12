/**
 * Reviews list component to display professional reviews
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface Review {
  _id: string;
  clientName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verified: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Statistics {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<number, number>;
}

interface ReviewsData {
  reviews: Review[];
  pagination: Pagination;
  statistics: Statistics;
}

interface ReviewsListProps {
  professionalId: string;
}

export default function ReviewsList({ professionalId }: ReviewsListProps) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const t = useTranslations();

  useEffect(() => {
    fetchReviews();
  }, [professionalId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?professionalId=${professionalId}&page=${page}&limit=5`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading reviews...</div>;
  }

  if (!data || data.statistics.totalReviews === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
        <p style={{ color: '#6b7280' }}>{t.reviews.noReviews}</p>
      </div>
    );
  }

  const { reviews, statistics, pagination } = data;
  const { averageRating, totalReviews, ratingBreakdown } = statistics;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>{t.reviews.title}</h3>

      {/* Rating Summary */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2563eb' }}>
            {averageRating}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {t.reviews.averageRating}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {totalReviews} {t.reviews.reviewCount}
          </div>
        </div>

        {/* Rating Breakdown */}
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating}>
            <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              {rating} ⭐
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${totalReviews > 0 ? (ratingBreakdown[rating] / totalReviews) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#fbbf24',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {ratingBreakdown[rating]}
            </div>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reviews.map((review) => (
          <div
            key={review._id}
            style={{
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{review.title}</h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  {review.clientName}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1rem' }}>{renderStars(review.rating)}</div>
                {review.verified && (
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600', marginTop: '0.25rem' }}>
                    ✓ {t.reviews.verified}
                  </div>
                )}
              </div>
            </div>

            <p style={{ margin: '0.75rem 0', fontSize: '0.95rem', lineHeight: '1.5', color: '#374151' }}>
              {review.comment}
            </p>

            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <span style={{ padding: '0.5rem 1rem' }}>
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
              opacity: page === pagination.pages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

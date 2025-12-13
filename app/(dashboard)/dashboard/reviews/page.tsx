/**
 * Admin Reviews Management Page
 * View pending reviews and approve/reject them
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Review {
  _id: string;
  professional: {
    _id: string;
    name: string;
    slug: string;
  };
  clientName: string;
  clientEmail: string;
  rating: number;
  title: string;
  comment: string;
  approved: boolean;
  verified: boolean;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'all'>('pending');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        status,
        page: page.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/admin/reviews?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.data.reviews);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading reviews');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);

      const response = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reviewId,
          approved: true,
          verified: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve review');
      }

      // Remove from list
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      setActionLoading(reviewId);

      const response = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject review');
      }

      // Remove from list
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject review');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reviews Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Approve or reject user reviews for professionals
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`rounded px-4 py-2 font-medium transition ${
              status === s
                ? 'bg-sky-600 text-white dark:bg-sky-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'pending' && pagination ? ` (${reviews.length})` : ''}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      )}

      {/* Reviews List */}
      {!loading && reviews.length === 0 ? (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            No {status === 'all' ? '' : status} reviews found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/professionals/${review.professional.slug}`}
                    className="text-lg font-semibold text-sky-600 hover:underline dark:text-sky-400"
                  >
                    {review.professional.name}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {review.clientName} ({review.clientEmail})
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex gap-2">
                  {review.approved && (
                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                      Approved
                    </span>
                  )}
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7.305 4.5 3.3 7.188 1.5 11c1.8 3.812 5.805 6.5 10.5 6.5s8.7-2.688 10.5-6.5c-1.8-3.812-5.805-6.5-10.5-6.5zm0 9c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-3 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                  </svg>
                ))}
                <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">
                  {review.rating}.0
                </span>
              </div>

              {/* Title and Comment */}
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white">{review.title}</p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{review.comment}</p>
              </div>

              {/* Metadata */}
              <p className="mb-4 text-xs text-gray-500 dark:text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()} at{' '}
                {new Date(review.createdAt).toLocaleTimeString()}
              </p>

              {/* Actions */}
              {!review.approved && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleApprove(review._id)}
                    disabled={actionLoading === review._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(review._id)}
                    disabled={actionLoading === review._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                    </svg>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50 dark:bg-gray-700"
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50 dark:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

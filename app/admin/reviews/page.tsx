/**
 * Admin Reviews Management Page
 * Allows admin to view, approve, reject, and delete reviews
 */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Review {
  _id: string;
  professional: { _id: string; name: string; slug: string };
  clientName: string;
  clientEmail: string;
  rating: number;
  title: string;
  comment: string;
  approved: boolean;
  verified: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [status, setStatus] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reviews?status=${status}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.log('[AdminReviewsPage] Raw API response:', data);
        }
        setReviews(data.data?.reviews || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load reviews');
        setLoading(false);
      });
  }, [refresh, status]);

  const handleApprove = async (reviewId: string) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reviewId, approved: true }),
    });
    setRefresh(r => r + 1);
  };

  const handleReject = async (reviewId: string) => {
    await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reviewId, approved: false }),
    });
    setRefresh(r => r + 1);
  };

  const handleDelete = async (reviewId: string) => {
    await fetch(`/api/admin/reviews?id=${reviewId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setRefresh(r => r + 1);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Reviews Management</h1>
      <div className="mb-6 flex gap-4">
        <label>
          <input
            type="radio"
            name="status"
            value="pending"
            checked={status === 'pending'}
            onChange={() => setStatus('pending')}
          />{' '}
          Pending
        </label>
        <label>
          <input
            type="radio"
            name="status"
            value="approved"
            checked={status === 'approved'}
            onChange={() => setStatus('approved')}
          />{' '}
          Approved
        </label>
        <label>
          <input
            type="radio"
            name="status"
            value="all"
            checked={status === 'all'}
            onChange={() => setStatus('all')}
          />{' '}
          All
        </label>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : reviews.length === 0 ? (
        <p>No reviews found for this filter.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold">{review.professional.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({review.professional.slug})</span>
                </div>
                <span className="text-yellow-500 font-bold">{review.rating}★</span>
              </div>
              <div className="mb-2">
                <span className="font-medium">{review.clientName}</span>
                <span className="ml-2 text-xs text-gray-400">{review.clientEmail}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">{review.title}</span>
                <p className="text-gray-700 mt-1">{review.comment}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="primary" onClick={() => handleApprove(review._id)}>
                  Approve
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleReject(review._id)}>
                  Reject
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(review._id)}>
                  Delete
                </Button>
              </div>
              <div className="text-xs text-gray-400 mt-2">Submitted: {new Date(review.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

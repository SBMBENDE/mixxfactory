/**
 * Professional Reviews Page
 * Display all reviews (approved and pending) for the professional
 * Shows rating stats and detailed feedback
 */

'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheckCircle, faClock, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

interface Review {
  _id: string;
  clientName: string;
  clientEmail: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/professional/reviews');
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || []);
        setStats(data.stats);
      } else {
        console.error('Failed to fetch reviews:', data.error);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = (reviews || []).filter(review => {
    if (filter === 'approved') return review.approved;
    if (filter === 'pending') return !review.approved;
    return true;
  });

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={faStar}
        className={index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500 dark:text-gray-400">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ⭐ Your Reviews
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See what clients are saying about your services
        </p>
      </div>

      {stats && stats.total > 0 ? (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Average Rating */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">Average Rating</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                  {stats.averageRating}
                </div>
                <div className="text-yellow-600 dark:text-yellow-400 pb-1">/ 5.0</div>
              </div>
              <div className="flex gap-1 mt-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>

            {/* Total Reviews */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Total Reviews</div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats.total}
              </div>
            </div>

            {/* Approved */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-600 dark:text-green-400 mb-2">Published</div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {stats.approved}
              </div>
            </div>

            {/* Pending */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-sm text-orange-600 dark:text-orange-400 mb-2">Pending Approval</div>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {stats.pending}
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rating Distribution
            </h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {rating}
                      </span>
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Published ({stats.approved})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Pending ({stats.pending})
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <div
                  key={review._id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 ${
                    review.approved
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {review.clientName}
                        </h3>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-xs" />
                            Verified
                          </span>
                        )}
                        {review.approved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
                            <FontAwesomeIcon icon={faClock} className="text-xs" />
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mb-2">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {review.title}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No {filter !== 'all' ? filter : ''} reviews to display
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Reviews Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            You haven&apos;t received any reviews yet. Once clients leave feedback about your services, 
            they&apos;ll appear here.
          </p>
        </div>
      )}
    </div>
  );
}

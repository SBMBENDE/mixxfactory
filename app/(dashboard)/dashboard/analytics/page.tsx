/**
 * Admin Analytics Page
 * Comprehensive analytics dashboard with charts and detailed metrics
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Analytics {
  totalProfessionals: number;
  activeProfessionals: number;
  inactiveProfessionals: number;
  totalCategories: number;
  featuredListings: number;
  categoriesBreakdown: Array<{
    name: string;
    count: number;
    featured: number;
    active: number;
  }>;
  professionalsByRating: Array<{
    rating: number;
    count: number;
  }>;
  recentProfessionals: Array<{
    _id: string;
    name: string;
    category: string;
    createdAt: string;
    active: boolean;
    featured: boolean;
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || 'Failed to load analytics'}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getActivePercentage = () => {
    if (analytics.totalProfessionals === 0) return 0;
    return Math.round((analytics.activeProfessionals / analytics.totalProfessionals) * 100);
  };

  const getFeaturedPercentage = () => {
    if (analytics.totalProfessionals === 0) return 0;
    return Math.round((analytics.featuredListings / analytics.totalProfessionals) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Professionals */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Professionals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalProfessionals}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        {/* Active Professionals */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Professionals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.activeProfessionals}</p>
              <p className="text-sm text-green-600 mt-1">{getActivePercentage()}% of total</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        {/* Featured Listings */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Featured Listings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.featuredListings}</p>
              <p className="text-sm text-yellow-600 mt-1">{getFeaturedPercentage()}% of total</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalCategories}</p>
            </div>
            <div className="text-3xl">🏷️</div>
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Categories Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Active</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Featured</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {analytics.categoriesBreakdown.length > 0 ? (
                analytics.categoriesBreakdown.map((category, idx) => {
                  const percentage =
                    analytics.totalProfessionals > 0
                      ? Math.round((category.count / analytics.totalProfessionals) * 100)
                      : 0;
                  return (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {category.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          {category.active}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                          {category.featured}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-600">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No categories data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ratings Distribution */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Ratings Distribution</h2>
        </div>
        <div className="p-6">
          {analytics.professionalsByRating.length > 0 ? (
            <div className="space-y-4">
              {[5, 4, 3, 2, 1, 0].map((rating) => {
                const ratingData = analytics.professionalsByRating.find((r) => r.rating === rating);
                const count = ratingData?.count || 0;
                const percentage =
                  analytics.totalProfessionals > 0
                    ? Math.round((count / analytics.totalProfessionals) * 100)
                    : 0;

                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="w-24 flex items-center gap-1">
                      {rating === 0 ? (
                        <span className="text-sm text-gray-600">Unrated</span>
                      ) : (
                        <>
                          <span className="text-sm font-medium">{rating}</span>
                          <span className="text-yellow-400">{'★'.repeat(rating)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-6 flex items-center">
                        {percentage > 0 && (
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-6 rounded-full flex items-center justify-end px-2"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 10 && (
                              <span className="text-xs font-medium text-white">{percentage}%</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-600">{count}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No ratings data available</p>
          )}
        </div>
      </div>

      {/* Recent Professionals */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recently Added Professionals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date Added</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Featured</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentProfessionals.length > 0 ? (
                analytics.recentProfessionals.map((prof, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{prof.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{prof.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(prof.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          prof.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prof.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {prof.featured ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          ⭐ Featured
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/professionals/${prof._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No professionals yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <p className="text-blue-900 text-sm font-medium mb-2">Inactive Professionals</p>
          <p className="text-3xl font-bold text-blue-900">{analytics.inactiveProfessionals}</p>
          <p className="text-xs text-blue-700 mt-2">
            {analytics.totalProfessionals > 0
              ? Math.round((analytics.inactiveProfessionals / analytics.totalProfessionals) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <p className="text-purple-900 text-sm font-medium mb-2">Average Category Size</p>
          <p className="text-3xl font-bold text-purple-900">
            {analytics.totalCategories > 0
              ? Math.round(analytics.totalProfessionals / analytics.totalCategories)
              : 0}
          </p>
          <p className="text-xs text-purple-700 mt-2">professionals per category</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <p className="text-green-900 text-sm font-medium mb-2">Inactive Categories</p>
          <p className="text-3xl font-bold text-green-900">
            {analytics.categoriesBreakdown.filter((c) => c.count === 0).length}
          </p>
          <p className="text-xs text-green-700 mt-2">categories with no listings</p>
        </div>
      </div>
    </div>
  );
}

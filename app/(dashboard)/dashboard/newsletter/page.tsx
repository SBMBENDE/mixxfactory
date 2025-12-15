/**
 * Admin Newsletter Management Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Subscriber {
  _id: string;
  email: string;
  firstName?: string;
  subscribed: boolean;
  verified: boolean;
  categories: string[];
  subscribedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    subscribers: Subscriber[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message: string;
}

export default function NewsletterManagementPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());

  const limit = 20;

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/admin/newsletter?${params}`, {
        credentials: 'include',
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to fetch subscribers');
        setLoading(false);
        return;
      }

      setSubscribers(data.data.subscribers);
      setTotalPages(data.data.pagination.pages);
      setTotal(data.data.pagination.total);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch subscribers');
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSubscribers(new Set(subscribers.map((s) => s._id)));
    } else {
      setSelectedSubscribers(new Set());
    }
  };

  const handleSelectSubscriber = (id: string) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSubscribers(newSelected);
  };

  const handleUnsubscribe = async (id: string) => {
    if (!confirm('Unsubscribe this subscriber?')) return;

    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to unsubscribe');
        return;
      }

      setSubscribers(subscribers.filter((s) => s._id !== id));
      setSelectedSubscribers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      setError('Failed to unsubscribe');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          📧 Newsletter Subscribers
        </h1>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Subscribers: <span className="font-bold text-lg">{total}</span>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Subscribers</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Active</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {subscribers.filter((s) => s.subscribed).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-yellow-600">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Verified</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {subscribers.filter((s) => s.verified).length}
          </p>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            Loading subscribers...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            No subscribers yet
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.size === subscribers.length && subscribers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.has(subscriber._id)}
                          onChange={() => handleSelectSubscriber(subscriber._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                          {subscriber.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subscriber.firstName || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            subscriber.subscribed && subscriber.verified
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : subscriber.subscribed
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {subscriber.verified ? '✓' : '○'} {subscriber.subscribed ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleUnsubscribe(subscriber._id)}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

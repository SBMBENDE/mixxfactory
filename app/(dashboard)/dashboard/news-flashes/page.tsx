'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface NewsFlash {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  published: boolean;
  priority: number;
  startDate: string;
  endDate: string;
  link?: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    newsFlashes: NewsFlash[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message: string;
}

const typeColors = {
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
};

export default function NewsFlashesPage() {
  const [flashes, setFlashes] = useState<NewsFlash[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const limit = 10;

  const fetchFlashes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/admin/news-flashes?${params}`, {
        credentials: 'include',
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to fetch news flashes');
        return;
      }

      setFlashes(data.data.newsFlashes);
      setTotalPages(data.data.pagination.pages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch news flashes';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFlashes();
  }, [fetchFlashes]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/news-flashes?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        setError('Failed to delete news flash');
        return;
      }

      setFlashes(flashes.filter((f) => f._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete news flash';
      setError(message);
    }
  };

  const togglePublished = async (id: string, currentState: boolean) => {
    try {
      const response = await fetch('/api/admin/news-flashes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          published: !currentState,
        }),
      });

      if (!response.ok) {
        setError('Failed to update news flash');
        return;
      }

      setFlashes(
        flashes.map((f) => (f._id === id ? { ...f, published: !currentState } : f))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update news flash';
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">News Flashes</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage announcements and important messages for your users
          </p>
        </div>
        <Link
          href="/dashboard/news-flashes/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Flash
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Flashes Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading news flashes...</p>
          </div>
        ) : flashes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No news flashes found</p>
            <Link
              href="/dashboard/news-flashes/new"
              className="mt-4 inline-flex text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Create your first flash →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {flashes.map((flash) => (
                  <tr
                    key={flash._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {flash.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {flash.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                          typeColors[flash.type]
                        }`}
                      >
                        {flash.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublished(flash._id, flash.published)}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          flash.published
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                        }`}
                      >
                        {flash.published ? '✓ Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {flash.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        Start: {new Date(flash.startDate).toLocaleDateString()}
                      </div>
                      <div>End: {new Date(flash.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/dashboard/news-flashes/${flash._id}/edit`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </Link>
                      {deleteConfirm === flash._id ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleDelete(flash._id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(flash._id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

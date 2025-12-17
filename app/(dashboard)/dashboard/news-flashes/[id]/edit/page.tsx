'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface NewsFlash {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: number;
  startDate: string;
  endDate: string;
  published: boolean;
  link?: string;
}

export default function EditNewsFlashPage() {
  const router = useRouter();
  const params = useParams();
  const flashId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<NewsFlash | null>(null);

  const fetchFlash = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/news-flashes?id=${flashId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError('Failed to load news flash');
        return;
      }

      const flash = data.data.newsFlashes[0];
      setFormData({
        _id: flash._id,
        title: flash.title,
        message: flash.message,
        type: flash.type,
        priority: flash.priority,
        startDate: new Date(flash.startDate).toISOString().split('T')[0],
        endDate: new Date(flash.endDate).toISOString().split('T')[0],
        published: flash.published,
        link: flash.link || '',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load news flash';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [flashId]);

  useEffect(() => {
    if (flashId) {
      fetchFlash();
    }
  }, [flashId, fetchFlash]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!formData) return;

    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required');
        setSubmitting(false);
        return;
      }
      if (!formData.message.trim()) {
        setError('Message is required');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/news-flashes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: formData._id,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          priority: formData.priority,
          startDate: formData.startDate,
          endDate: formData.endDate,
          published: formData.published,
          link: formData.link || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update news flash');
        return;
      }

      router.push('/dashboard/news-flashes');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update news flash';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error || 'News flash not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit News Flash</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{formData.title}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          {formData && (
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="info">📰 Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="error">❌ Error</option>
              <option value="success">✅ Success</option>
            </select>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority (1 = highest)
          </label>
          <input
            type="number"
            name="priority"
            min="1"
            max="10"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Redirect Link (optional)
          </label>
          {formData && (
            <>
              <input
                type="text"
                name="link"
                value={formData.link || ''}
                onChange={handleChange}
                placeholder="e.g., /events or https://example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Users will be redirected when clicking this news flash. Use internal paths (e.g., /events) or full URLs (e.g., https://example.com)
              </p>
            </>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Published */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

const CATEGORIES = ['Technology', 'Business', 'Lifestyle', 'Events', 'Tips', 'News'];

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage: string;
  featured: boolean;
  published: boolean;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<BlogPost | null>(null);

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/blog/posts?id=${postId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError('Failed to load post');
        return;
      }

      setFormData(data.data.post);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load post';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId, fetchPost]);

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
      if (!formData.content.trim()) {
        setError('Content is required');
        setSubmitting(false);
        return;
      }
      if (!formData.excerpt.trim()) {
        setError('Excerpt is required');
        setSubmitting(false);
        return;
      }
      if (!formData.author.trim()) {
        setError('Author is required');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/blog/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: formData._id,
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          category: formData.category,
          tags: Array.isArray(formData.tags)
            ? formData.tags
            : (formData.tags as string)
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t),
          author: formData.author,
          featuredImage: formData.featuredImage,
          featured: formData.featured,
          published: formData.published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to update post');
        return;
      }

      router.push('/dashboard/blog');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post';
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
      <div className="max-w-4xl mx-auto">
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error || 'Post not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Blog Post</h1>
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Author *
          </label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Category & Featured */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
            </label>
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
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excerpt *
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={2}
            maxLength={300}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.excerpt.length}/300 characters
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Markdown formatting is supported
          </p>
        </div>

        {/* Featured Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Featured Image URL
          </label>
          <input
            type="url"
            name="featuredImage"
            value={formData.featuredImage}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            name="tags"
            value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
            onChange={(e) => {
              setFormData({
                ...formData,
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter((t) => t),
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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

/**
 * Admin Blog Management Dashboard
 * List, create, edit, and delete blog posts
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Search } from 'lucide-react';
import { AppImage } from '@/components/AppImage';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'published') params.set('published', 'true');
      if (filter === 'draft') params.set('published', 'false');

      const response = await fetch(`/api/admin/blog/posts?${params}`, {
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setPosts(data.data.posts || []);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Error loading posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/admin/blog/posts?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.filter((p) => p._id !== id));
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (err) {
      alert('Error deleting post');
      console.error(err);
    }
  };

  const handleTogglePublished = async (post: BlogPost) => {
    try {
      const response = await fetch('/api/admin/blog/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: post._id,
          published: !post.published,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchPosts();
      } else {
        alert(data.message || 'Failed to update post');
      }
    } catch (err) {
      alert('Error updating post');
      console.error(err);
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      const response = await fetch('/api/admin/blog/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: post._id,
          featured: !post.featured,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchPosts();
      } else {
        alert(data.message || 'Failed to update post');
      }
    } catch (err) {
      alert('Error updating post');
      console.error(err);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage blog posts
            </p>
          </div>

          <Link
            href="/dashboard/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'published', 'draft'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    filter === f
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No posts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <AppImage
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {post.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
                        {post.category}
                      </span>
                      <span>{post.views} views</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.featured && (
                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          Featured
                        </span>
                      )}
                      <span className={post.published ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                        {post.published ? '● Published' : '○ Draft'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <Link
                        href={`/dashboard/admin/blog/${post.slug}/edit`}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>

                      <button
                        onClick={() => handleTogglePublished(post)}
                        className={`flex items-center gap-1 px-3 py-1 rounded transition-colors text-sm ${
                          post.published
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>

                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`flex items-center gap-1 px-3 py-1 rounded transition-colors text-sm ${
                          post.featured
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${post.featured ? 'fill-current' : ''}`} />
                        {post.featured ? 'Unfeature' : 'Feature'}
                      </button>

                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>

                      <button
                        onClick={() => handleDelete(post._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm ml-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

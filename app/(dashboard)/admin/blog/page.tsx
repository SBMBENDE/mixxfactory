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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filter === 'published') params.set('published', 'true');
      if (filter === 'draft') params.set('published', 'false');

      const response = await fetch(`/api/admin/blog/posts?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const postsArray = data.data.posts || [];
        setPosts(postsArray);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error loading posts';
      setError(errorMsg);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.log('Toggling published for post:', post.title, 'from', post.published, 'to', !post.published);
      
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
      console.log('Toggle published response:', data);
      
      if (data.success) {
        const newPublishedState = !post.published;
        alert(`Post ${newPublishedState ? 'published' : 'unpublished'} successfully!`);
        
        // If we're on a filter that would hide this post after the change, switch to "All"
        if (filter === 'draft' && newPublishedState) {
          setFilter('all');
        } else if (filter === 'published' && !newPublishedState) {
          setFilter('all');
        }
        
        // Refresh posts from server
        await fetchPosts();
      } else {
        alert(data.message || 'Failed to update post');
      }
    } catch (err: any) {
      alert('Error updating post: ' + (err.message || 'Unknown error'));
      console.error('Toggle published error:', err);
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      console.log('Toggling featured for post:', post.title, 'from', post.featured, 'to', !post.featured);
      
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
      console.log('Toggle featured response:', data);
      
      if (data.success) {
        // Update local state immediately
        setPosts(posts.map(p => 
          p._id === post._id 
            ? { ...p, featured: !p.featured } 
            : p
        ));
        // Also fetch fresh data
        await fetchPosts();
        alert(`Post ${!post.featured ? 'featured' : 'unfeatured'} successfully!`);
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
    (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Total posts:', posts.length);
  console.log('Filtered posts:', filteredPosts.length);
  console.log('Search query:', searchQuery);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage blog posts
            </p>
          </div>

          <Link
            href="/admin/blog/new"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full">
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
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {['all', 'published', 'draft'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as typeof filter)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors whitespace-nowrap ${
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
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
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 break-words">
                          {post.title}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3">
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">
                        {post.category}
                      </span>
                      <span>{post.views} views</span>
                      <span className="hidden sm:inline">{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.featured && (
                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                          <span className="hidden sm:inline">Featured</span>
                        </span>
                      )}
                      <span className={post.published ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                        {post.published ? '● Published' : '○ Draft'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 mt-4">
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>

                      <button
                        onClick={() => handleTogglePublished(post)}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded transition-colors text-sm ${
                          post.published
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="hidden sm:inline">{post.published ? 'Unpublish' : 'Publish'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded transition-colors text-sm ${
                          post.featured
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${post.featured ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">{post.featured ? 'Unfeature' : 'Feature'}</span>
                      </button>

                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(post._id)}
                        className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm sm:ml-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
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

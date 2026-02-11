/**
 * Modern Blog Homepage - Production Ready
 * Features: Featured posts, grid layout, filtering, search, pagination
 */

'use client';

import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Clock } from 'lucide-react';
import BlogCard from '@/components/blog/BlogCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import SearchBar from '@/components/blog/SearchBar';
import Newsletter from '@/components/Newsletter';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface BlogData {
  posts: BlogPost[];
  totalPages: number;
  availableCategories: string[];
  availableTags: string[];
}

export default function BlogPage() {
  const [data, setData] = useState<BlogData>({
    posts: [],
    totalPages: 1,
    availableCategories: [],
    availableTags: [],
  });
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch featured posts
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/blog/posts?featured=true&limit=3');
        const result = await response.json();
        if (result.success && result.data?.posts) {
          setFeaturedPosts(result.data.posts);
        }
      } catch (err) {
        console.error('Error loading featured posts:', err);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '9',
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCategory && { category: selectedCategory }),
        });

        const response = await fetch(`/api/blog/posts?${params}`);
        const result = await response.json();

        if (result.success && result.data) {
          setData({
            posts: result.data.posts || [],
            totalPages: result.data.pagination?.pages || 1,
            availableCategories: result.data.availableCategories || [],
            availableTags: result.data.availableTags || [],
          });
        } else {
          setError('Failed to load blog posts');
        }
      } catch (err) {
        setError('Error loading blog posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 dark:from-orange-700 dark:via-orange-600 dark:to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Afrobizz Blog</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Insights, Stories & Updates
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Discover the latest trends, tips, and stories from Africa's creative and business community
            </p>

            {/* Search Bar */}
            <div className="flex justify-center">
              <SearchBar onSearch={handleSearch} placeholder="Search articles..." />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Featured Post */}
            {featuredPosts[0] && (
              <div className="lg:col-span-2">
                <BlogCard post={featuredPosts[0]} variant="featured" priority />
              </div>
            )}
            
            {/* Secondary Featured Posts */}
            {featuredPosts.slice(1, 3).map((post) => (
              <BlogCard key={post._id} post={post} variant="default" priority />
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              Latest Articles
            </h2>
            
            {(searchQuery || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
          
          <CategoryFilter
            categories={data.availableCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-xl aspect-[16/9] mb-4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && data.posts.length === 0 && (
          <div className="text-center py-16">
            <Clock className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedCategory
                ? 'Try adjusting your filters'
                : 'Check back soon for new content'}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Blog Posts Grid */}
        {!loading && !error && data.posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {data.posts.map((post) => (
                <BlogCard key={post._id} post={post} variant="default" />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === pageNum
                          ? 'bg-orange-600 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Newsletter />
        </div>
      </section>
    </div>
  );
}

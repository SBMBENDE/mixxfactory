'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage: string;
  published: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const t = useTranslations();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Fetch blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedTag && { tag: selectedTag }),
        });

        const response = await fetch(`/api/blog/posts?${params}`);
        const data = await response.json();

        if (data.success && data.data) {
          setPosts(data.data.posts);
          setTotalPages(data.data.totalPages);
          setCategories(data.data.availableCategories);
          setTags(data.data.availableTags);
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
  }, [page, searchQuery, selectedCategory, selectedTag]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTag('');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', paddingTop: '2rem', paddingBottom: '2rem', marginBottom: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Link href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>
              ← {t.blog.backToBlog} {t.nav.home}
            </Link>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
            {t.blog.title}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            {t.blog.posts} • {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        {/* Search & Filter Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder={t.blog.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {t.common.search}
              </button>
            </div>
          </form>

          {/* Filter Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              <option value="">{t.blog.filterByCategory}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              <option value="">{t.blog.filterByTag}</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            {/* View Type Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewType('grid')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: viewType === 'grid' ? '#3b82f6' : '#e5e7eb',
                  color: viewType === 'grid' ? '#fff' : '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewType('list')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: viewType === 'list' ? '#3b82f6' : '#e5e7eb',
                  color: viewType === 'list' ? '#fff' : '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                ≡ List
              </button>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedCategory || selectedTag) && (
            <button
              onClick={clearFilters}
              style={{
                color: '#3b82f6',
                backgroundColor: 'transparent',
                border: '1px solid #3b82f6',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ color: '#6b7280' }}>{t.common.loading}</div>
          </div>
        ) : error ? (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            {t.blog.noArticles}
          </div>
        ) : (
          <>
            {/* Blog Posts Grid/List */}
            <div
              style={{
                display: viewType === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: viewType === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
                flexDirection: viewType === 'list' ? 'column' : undefined,
                gap: '2rem',
                marginBottom: '2rem',
              }}
            >
              {posts.map((post) => (
                <article
                  key={post._id}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: viewType === 'list' ? 'row' : 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div
                      style={{
                        width: viewType === 'list' ? '250px' : '100%',
                        height: viewType === 'list' ? '200px' : '200px',
                        backgroundColor: '#e5e7eb',
                        backgroundImage: `url(${post.featuredImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* Content */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#6b7280', flexWrap: 'wrap' }}>
                      {post.category && (
                        <span
                          style={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                          }}
                        >
                          {post.category}
                        </span>
                      )}
                      {post.featured && (
                        <span
                          style={{
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                          }}
                        >
                          ⭐ {t.blog.featured}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                      <h2
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          marginBottom: '0.75rem',
                          color: '#111827',
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
                      >
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p style={{ color: '#6b7280', marginBottom: '1rem', flex: 1 }}>
                      {post.excerpt || post.content.substring(0, 150) + '...'}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span>{post.author}</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span>👁 {post.views}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                        {t.blog.readMore} →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: page === 1 ? '#f3f4f6' : '#fff',
                    color: page === 1 ? '#9ca3af' : '#374151',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      backgroundColor: page === pageNum ? '#3b82f6' : '#fff',
                      color: page === pageNum ? '#fff' : '#374151',
                      cursor: 'pointer',
                      fontWeight: page === pageNum ? '600' : '400',
                    }}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    backgroundColor: page === totalPages ? '#f3f4f6' : '#fff',
                    color: page === totalPages ? '#9ca3af' : '#374151',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

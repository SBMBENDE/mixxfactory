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

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const t = useTranslations();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/posts/${params.slug}`);
        const data = await response.json();

        if (data.success && data.data?.post) {
          setPost(data.data.post);
          // Fetch related posts based on category
          const relatedResponse = await fetch(`/api/blog/posts?category=${data.data.post.category}&limit=3`);
          const relatedData = await relatedResponse.json();
          setRelatedPosts(relatedData.data?.posts?.filter((p: BlogPost) => p.slug !== params.slug).slice(0, 3) || []);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError('Error loading post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280' }}>{t.common.loading}</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#991b1b', marginBottom: '1rem' }}>{error || t.common.error}</p>
          <Link href="/blog" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem', marginBottom: '2rem' }}>
        <Link href="/blog" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← {t.blog.backToBlog}
        </Link>
      </div>

      {/* Main Article */}
      <article style={{ maxWidth: '800px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        {/* Featured Image */}
        {post.featuredImage && (
          <div
            style={{
              width: '100%',
              height: '400px',
              backgroundColor: '#e5e7eb',
              backgroundImage: `url(${post.featuredImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
            }}
          />
        )}

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {post.category && (
              <span
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
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
                  fontSize: '0.75rem',
                  fontWeight: '500',
                }}
              >
                ⭐ Featured
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827', lineHeight: '1.3' }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', gap: '1.5rem', color: '#6b7280', fontSize: '0.875rem', flexWrap: 'wrap', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✍️</span>
              <span>{post.author}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📅</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            {post.updatedAt !== post.createdAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔄</span>
                <span>{t.blog.updated}: {formatDate(post.updatedAt)}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👁</span>
              <span>{post.views} {t.blog.views}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            fontSize: '1rem',
            lineHeight: '1.75',
            color: '#374151',
            marginBottom: '2rem',
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ marginBottom: '0.75rem', fontWeight: '600', color: '#111827' }}>{t.blog.tags}:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#3b82f6',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <p style={{ marginBottom: '1rem', fontWeight: '600', color: '#111827' }}>{t.blog.share}:</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.href : ''}&text=${post.title}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: '#1da1f2',
                color: '#fff',
                borderRadius: '50%',
                textDecoration: 'none',
              }}
            >
              𝕏
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: '#1877f2',
                color: '#fff',
                borderRadius: '50%',
                textDecoration: 'none',
              }}
            >
              f
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? window.location.href : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: '#0a66c2',
                color: '#fff',
                borderRadius: '50%',
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              in
            </a>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem', marginTop: '4rem' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#111827' }}>
            {t.blog.related}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {relatedPosts.map((relPost) => (
              <Link
                key={relPost._id}
                href={`/blog/${relPost.slug}`}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
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
                {relPost.featuredImage && (
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#e5e7eb',
                      backgroundImage: `url(${relPost.featuredImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
                    {relPost.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {formatDate(relPost.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced Blog Post Detail Page - Production Ready
 * Features: SEO optimization, structured data, TOC, social sharing, related posts
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';

// Force dynamic rendering to prevent stale content
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog/posts/${slug}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      return {
        title: 'Post Not Found',
      };
    }

    const result = await response.json();
    const post = result.data?.post || result.data;

    return {
      title: `${post.title} | Afrobizz Blog`,
      description: post.excerpt,
      keywords: post.tags.join(', '),
      authors: [{ name: post.author }],
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [post.author],
        tags: post.tags,
        images: post.featuredImage ? [{ url: post.featuredImage }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  try {
    const { slug } = await params;
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog/posts/${slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      notFound();
    }

    const result = await response.json();
    const post = result.data?.post || result.data;

    // Fetch related posts
    const relatedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog/posts?category=${post.category}&limit=3`,
      { cache: 'no-store' }
    );
    const relatedData = await relatedResponse.json();
    const relatedPosts = relatedData.data?.posts || [];

    return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
  } catch (error) {
    notFound();
  }
}

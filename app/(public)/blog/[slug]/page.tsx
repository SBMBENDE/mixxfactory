/**
 * Enhanced Blog Post Detail Page - Production Ready
 * Features: SEO optimization, structured data, TOC, social sharing, related posts
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import { connectDB } from '@/lib/db/connection';
import { BlogPostModel } from '@/lib/db/models';

// Force dynamic rendering to prevent stale content
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = params;
    
    await connectDB();
    const post = await BlogPostModel.findOne({ slug, published: true }).lean();
    
    if (!post) {
      return {
        title: 'Post Not Found',
      };
    }

    return {
      title: `${post.title} | Afrobizz Blog`,
      description: post.excerpt,
      keywords: post.tags.join(', '),
      authors: [{ name: post.author }],
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
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
    const { slug } = params;
    
    await connectDB();
    const post = await BlogPostModel.findOne({ slug, published: true }).lean();

    if (!post) {
      notFound();
    }

    // Increment view count (fire and forget)
    BlogPostModel.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).catch(() => {});

    // Fetch related posts
    const relatedPosts = await BlogPostModel.find({
      category: post.category,
      published: true,
      _id: { $ne: post._id }
    })
    .limit(3)
    .sort({ createdAt: -1 })
    .lean();

    // Convert MongoDB documents to plain objects with string IDs
    const postData = {
      ...post,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    const relatedPostsData = relatedPosts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return <BlogPostClient post={postData} relatedPosts={relatedPostsData} />;
  } catch (error) {
    notFound();
  }
}

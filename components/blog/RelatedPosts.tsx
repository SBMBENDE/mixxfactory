/**
 * RelatedPosts Component - Show related blog posts
 */

'use client';

import BlogCard from './BlogCard';

interface RelatedPostsProps {
  posts: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    tags: string[];
    author: string;
    featuredImage?: string;
    views: number;
    createdAt: string;
  }>;
  currentPostId: string;
}

export default function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  // Filter out current post
  const relatedPosts = posts.filter((post) => post._id !== currentPostId).slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Related Articles
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard key={post._id} post={post} variant="default" />
        ))}
      </div>
    </section>
  );
}

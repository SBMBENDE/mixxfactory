/**
 * BlogCard Component - Reusable blog post card
 * Used in blog listing, related posts, and search results
 */

'use client';

import Link from 'next/link';
import { AppImage } from '@/components/AppImage';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  post: {
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
  };
  variant?: 'default' | 'compact' | 'featured';
  priority?: boolean;
}

export default function BlogCard({ post, variant = 'default', priority = false }: BlogCardProps) {
  const readingTime = Math.ceil(post.excerpt.length / 200); // Rough estimate: 200 chars per minute

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (variant === 'featured') {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
          {/* Background Image Overlay */}
          {post.featuredImage && (
            <div className="absolute inset-0 opacity-20">
              <AppImage
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority={priority}
              />
            </div>
          )}
          
          {/* Content */}
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-wide">
                Featured
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 group-hover:text-orange-100 transition-colors line-clamp-2">
              {post.title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-6 line-clamp-2 max-w-3xl">
              {post.excerpt}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="font-medium">{post.author}</span>
              <span>•</span>
              <span>{formatDate(post.createdAt)}</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {post.featuredImage && (
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <AppImage
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
              {post.category}
            </span>
            <h3 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </article>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
            <AppImage
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={priority}
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-orange-600 text-white text-xs font-semibold uppercase tracking-wide rounded-full shadow-lg">
                {post.category}
              </span>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {post.title}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">{post.author}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{formatDate(post.createdAt)}</span>
              <span>•</span>
              <span>{readingTime} min</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

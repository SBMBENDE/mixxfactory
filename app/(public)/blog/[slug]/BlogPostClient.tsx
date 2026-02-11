/**
 * Blog Post Client Component - Interactive elements
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AppImage } from '@/components/AppImage';
import { ArrowLeft, Calendar, Clock, Eye } from 'lucide-react';
import ShareButtons from '@/components/blog/ShareButtons';
import AuthorSection from '@/components/blog/AuthorSection';
import TableOfContents from '@/components/blog/TableOfContents';
import RelatedPosts from '@/components/blog/RelatedPosts';
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({ post, relatedPosts }: Props) {
  const readingTime = Math.ceil(post.content.split(' ').length / 200);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    // Increment view count
    fetch(`/api/blog/posts/${post.slug}/view`, { method: 'POST' }).catch(console.error);
  }, [post.slug]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  // Process content to add IDs to headings for TOC
  const processContent = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const headings = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }
    });
    
    return temp.innerHTML;
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: post.featuredImage,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            publisher: {
              '@type': 'Organization',
              name: 'Afrobizz',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
              },
            },
          }),
        }}
      />

      <article className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blog</span>
            </Link>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-orange-600 text-white text-xs font-semibold uppercase tracking-wide rounded-full">
                {post.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.views} views</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative w-full aspect-[21/9] bg-gray-900 overflow-hidden">
            <AppImage
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Table of Contents - Desktop */}
            <aside className="hidden lg:block lg:col-span-3">
              <TableOfContents content={post.content} />
            </aside>

            {/* Article Content */}
            <main className="lg:col-span-9">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-12">
                {/* Article Body */}
                <div
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-relaxed prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-img:rounded-xl prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950"
                  dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${tag}`}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-orange-100 dark:hover:bg-orange-900 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Buttons */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <ShareButtons
                    url={currentUrl}
                    title={post.title}
                  />
                </div>

                {/* Author Section */}
                <div className="mt-12">
                  <AuthorSection
                    author={{
                      name: post.author,
                      bio: 'Content creator and writer passionate about African business and culture.',
                      social: {
                        twitter: 'https://twitter.com/afrobizz',
                        linkedin: 'https://linkedin.com/company/afrobizz',
                        website: 'https://afrobizz.com',
                      },
                    }}
                  />
                </div>
              </div>

              {/* Related Posts */}
              <div className="mt-12">
                <RelatedPosts posts={relatedPosts} currentPostId={post._id} />
              </div>

              {/* Comments Placeholder */}
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Comments
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Comments section coming soon. Stay tuned for engaging discussions!
                </p>
              </div>
            </main>
          </div>
        </div>
      </article>
    </>
  );
}

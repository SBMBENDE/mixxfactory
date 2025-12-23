/**
 * Individual Blog Post API endpoint
 * GET - Fetch single blog post by slug
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { BlogPostModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';

// Cache for 1 hour - individual blog posts are stable
export const revalidate = 3600;

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDBWithTimeout();

    const { slug } = params;

    const post = await BlogPostModel.findOne({
      slug,
      published: true,
    }).lean();

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Increment views
    await BlogPostModel.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    return successResponse(
      {
        post: {
          _id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          category: post.category,
          tags: post.tags,
          author: post.author,
          featuredImage: post.featuredImage,
          featured: post.featured,
          views: post.views + 1, // Include the view we just added
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
      },
      'Post fetched successfully',
      200
    );
  } catch (error) {
    console.error('Blog post GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch post: ${errorMsg}`, 500);
  }
}

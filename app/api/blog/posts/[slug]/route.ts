/**
 * Individual Blog Post API endpoint
 * GET - Fetch single blog post by slug
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { BlogPostModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';

// Force dynamic to get fresh content on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDBWithTimeout();

    const { slug } = await params;

    const post = await BlogPostModel.findOne({
      slug,
      published: true,
    }).lean();

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Increment views
    await BlogPostModel.findByIdAndUpdate(post._id, { $inc: { views: 1 } });

    const responseData = successResponse(
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

    // Add aggressive cache control headers
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Blog post GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch post: ${errorMsg}`, 500);
  }
}

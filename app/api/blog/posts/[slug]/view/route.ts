/**
 * Blog Post View Counter API
 * Increments view count when a post is viewed
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BlogPostModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';

export async function POST(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const post = await BlogPostModel.findOneAndUpdate(
      { slug: params.slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    return successResponse({ views: post.views }, 'View counted', 200);
  } catch (error) {
    console.error('View tracking error:', error);
    return errorResponse('Failed to track view', 500);
  }
}

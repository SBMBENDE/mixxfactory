/**
 * Blog Comments API
 * GET - Fetch approved comments for a post
 * POST - Create new comment
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BlogCommentModel, BlogPostModel } from '@/lib/db/models';
import { successResponse, errorResponse, validationErrorResponse } from '@/utils/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createCommentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    // Get post by slug
    const post = await BlogPostModel.findOne({ slug }).lean();
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Get approved comments for this post
    const comments = await BlogCommentModel.find({
      postId: post._id.toString(),
      approved: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      {
        comments: comments.map((c) => ({
          _id: c._id.toString(),
          name: c.name,
          message: c.message,
          createdAt: c.createdAt,
        })),
        total: comments.length,
      },
      'Comments fetched successfully',
      200
    );
  } catch (error) {
    console.error('Blog comments GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch comments: ${errorMsg}`, 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    // Get post by slug
    const post = await BlogPostModel.findOne({ slug, published: true }).lean();
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    const body = await request.json();
    
    const validationResult = createCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { name, email, message } = validationResult.data;

    const comment = new BlogCommentModel({
      postId: post._id.toString(),
      name,
      email,
      message,
      approved: false, // Requires admin approval
    });

    await comment.save();

    return successResponse(
      {
        _id: comment._id.toString(),
        message: 'Comment submitted! It will appear after admin approval.',
      },
      'Comment created successfully',
      201
    );
  } catch (error) {
    console.error('Blog comment POST error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to create comment: ${errorMsg}`, 500);
  }
}

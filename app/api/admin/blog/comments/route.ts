/**
 * Admin Comments Management API
 * GET - Fetch all comments (approved and pending)
 * PUT - Approve/reject comment
 * DELETE - Delete comment
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BlogCommentModel } from '@/lib/db/models';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const approved = searchParams.get('approved');

    const filter: any = {};
    if (approved === 'true' || approved === 'false') {
      filter.approved = approved === 'true';
    }

    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      BlogCommentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogCommentModel.countDocuments(filter),
    ]);

    return successResponse(
      {
        comments: comments.map((c) => ({
          _id: c._id.toString(),
          postId: c.postId,
          name: c.name,
          email: c.email,
          message: c.message,
          approved: c.approved,
          createdAt: c.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Comments fetched successfully',
      200
    );
  } catch (error) {
    console.error('Admin comments GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch comments: ${errorMsg}`, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const body = await request.json();
    const { commentId, approved } = body;

    if (!commentId) {
      return errorResponse('Comment ID is required', 400);
    }

    const comment = await BlogCommentModel.findByIdAndUpdate(
      commentId,
      { approved },
      { new: true }
    );

    if (!comment) {
      return errorResponse('Comment not found', 404);
    }

    return successResponse(comment, 'Comment updated successfully', 200);
  } catch (error) {
    console.error('Admin comment PUT error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to update comment: ${errorMsg}`, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return errorResponse('Comment ID is required', 400);
    }

    const comment = await BlogCommentModel.findByIdAndDelete(commentId);

    if (!comment) {
      return errorResponse('Comment not found', 404);
    }

    return successResponse({ _id: commentId }, 'Comment deleted successfully', 200);
  } catch (error) {
    console.error('Admin comment DELETE error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to delete comment: ${errorMsg}`, 500);
  }
}

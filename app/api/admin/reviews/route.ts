/**
 * Admin Reviews Management API
 * GET - Fetch pending reviews
 * PUT - Approve/reject review
 * DELETE - Delete review
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ReviewModel } from '@/lib/db/models';
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
    const status = searchParams.get('status') || 'pending'; // pending, approved, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filter: any = {};

    if (status === 'pending') {
      filter.approved = false;
    } else if (status === 'approved') {
      filter.approved = true;
    }

    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      ReviewModel.find(filter)
        .populate('professionalId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewModel.countDocuments(filter),
    ]);

    return successResponse(
      {
        reviews: reviews.map((r) => ({
          _id: r._id.toString(),
          professional: {
            _id: (r.professionalId as any)._id,
            name: (r.professionalId as any).name,
            slug: (r.professionalId as any).slug,
          },
          clientName: r.clientName,
          clientEmail: r.clientEmail,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          approved: r.approved,
          verified: r.verified,
          createdAt: r.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Reviews fetched successfully',
      200
    );
  } catch (error) {
    console.error('Admin reviews GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch reviews: ${errorMsg}`, 500);
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
    const { reviewId, approved, verified } = body;

    if (!reviewId) {
      return errorResponse('Review ID is required', 400);
    }

    const review = await ReviewModel.findByIdAndUpdate(
      reviewId,
      {
        approved: approved !== undefined ? approved : undefined,
        verified: verified !== undefined ? verified : undefined,
      },
      { new: true }
    );

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    return successResponse(review, 'Review updated successfully', 200);
  } catch (error) {
    console.error('Admin reviews PUT error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to update review: ${errorMsg}`, 500);
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
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return errorResponse('Review ID is required', 400);
    }

    const review = await ReviewModel.findByIdAndDelete(reviewId);

    if (!review) {
      return errorResponse('Review not found', 404);
    }

    return successResponse(null, 'Review deleted successfully', 200);
  } catch (error) {
    console.error('Admin reviews DELETE error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to delete review: ${errorMsg}`, 500);
  }
}

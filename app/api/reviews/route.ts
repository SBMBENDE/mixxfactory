/**
 * Reviews API endpoint
 * GET - Fetch reviews for a professional
 * POST - Submit a new review
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { ReviewModel, ProfessionalModel } from '@/lib/db/models';
import { createReviewSchema } from '@/lib/validations';
import { successResponse, errorResponse, validationErrorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDBWithTimeout();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!professionalId) {
      return errorResponse('Professional ID is required', 400);
    }

    // Verify professional exists
    const professional = await ProfessionalModel.findById(professionalId);
    if (!professional) {
      return errorResponse('Professional not found', 404);
    }

    // Fetch approved reviews only
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      ReviewModel.find({
        professionalId,
        approved: true,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewModel.countDocuments({
        professionalId,
        approved: true,
      }),
    ]);

    // Calculate average rating
    const allReviews = await ReviewModel.find({
      professionalId,
      approved: true,
    }).lean();

    const averageRating =
      allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : 0;

    const ratingBreakdown = {
      5: allReviews.filter((r) => r.rating === 5).length,
      4: allReviews.filter((r) => r.rating === 4).length,
      3: allReviews.filter((r) => r.rating === 3).length,
      2: allReviews.filter((r) => r.rating === 2).length,
      1: allReviews.filter((r) => r.rating === 1).length,
    };

    return successResponse(
      {
        reviews: reviews.map((r) => ({
          _id: r._id.toString(),
          clientName: r.clientName,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          createdAt: r.createdAt,
          verified: r.verified,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        statistics: {
          averageRating: parseFloat(String(averageRating)),
          totalReviews: allReviews.length,
          ratingBreakdown,
        },
      },
      'Reviews fetched successfully',
      200
    );
  } catch (error) {
    console.error('Reviews GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch reviews: ${errorMsg}`, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDBWithTimeout();

    const body = await request.json();

    // Validate input
    const validationResult = createReviewSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { professionalId, clientName, clientEmail, rating, title, comment } = validationResult.data;

    // Verify professional exists
    const professional = await ProfessionalModel.findById(professionalId);
    if (!professional) {
      return errorResponse('Professional not found', 404);
    }

    // Check if review already exists from this email
    const existingReview = await ReviewModel.findOne({
      professionalId,
      clientEmail,
    });

    if (existingReview) {
      return errorResponse('You have already submitted a review for this professional', 409);
    }

    // Create review (requires admin approval)
    const review = new ReviewModel({
      professionalId,
      clientName,
      clientEmail,
      rating,
      title,
      comment,
      approved: false, // Requires admin approval
      verified: false,
    });

    await review.save();

    return successResponse(
      {
        _id: review._id.toString(),
        message: 'Review submitted successfully. Awaiting admin approval.',
      },
      'Review created',
      201
    );
  } catch (error) {
    console.error('Reviews POST error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to create review: ${errorMsg}`, 500);
  }
}

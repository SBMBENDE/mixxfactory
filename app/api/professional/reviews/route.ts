/**
 * Professional Reviews API
 * GET - Fetch professional's reviews
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, ReviewModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    await connectDB();

    const professional = await ProfessionalModel.findOne({ userId });
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Build query based on filter
    let query: any = { professionalId: professional._id };
    if (filter === 'approved') {
      query.approved = true;
    } else if (filter === 'pending') {
      query.approved = false;
    }

    const reviews = await ReviewModel.find(query).sort({ createdAt: -1 });

    // Calculate stats
    const allReviews = await ReviewModel.find({ professionalId: professional._id });
    const approvedReviews = allReviews.filter((r) => r.approved);
    const pendingReviews = allReviews.filter((r) => !r.approved);
    
    const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 0;

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: {
          total: allReviews.length,
          approved: approvedReviews.length,
          pending: pendingReviews.length,
          averageRating,
        },
      },
    });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load reviews',
      },
      { status: 500 }
    );
  }
}

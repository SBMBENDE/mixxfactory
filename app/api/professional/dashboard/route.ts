/**
 * Professional Dashboard API
 * GET - Fetch dashboard statistics and overview
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, ReviewModel, InquiryModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;

    await connectDB();

    // Find professional profile
    const professional = await ProfessionalModel.findOne({ userId }).select(
      'name slug verified subscriptionTier subscriptionExpiry analytics'
    );

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Get reviews stats
    const reviews = await ReviewModel.find({
      professionalId: professional._id,
      approved: true,
    }).select('rating clientName title createdAt').sort({ createdAt: -1 });

    const pendingReviews = await ReviewModel.countDocuments({
      professionalId: professional._id,
      approved: false,
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Get inquiries stats
    const inquiries = await InquiryModel.find({
      professionalId: professional._id,
    }).select('clientName subject status createdAt').sort({ createdAt: -1 }).limit(5);

    const newInquiries = await InquiryModel.countDocuments({
      professionalId: professional._id,
      status: 'new',
    });

    const totalInquiries = await InquiryModel.countDocuments({
      professionalId: professional._id,
    });

    // Calculate profile completion
    const profileFields = [
      professional.name,
      (professional as any).description,
      (professional as any).email,
      (professional as any).phone,
      (professional as any).location?.city,
      (professional as any).images?.length > 0,
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletionPercentage = Math.round((completedFields / profileFields.length) * 100);

    const dashboardData = {
      profile: {
        name: professional.name,
        slug: professional.slug,
        verified: professional.verified,
        subscriptionTier: professional.subscriptionTier || 'free',
        subscriptionExpiry: professional.subscriptionExpiry,
        profileCompletionPercentage,
      },
      analytics: {
        viewsThisMonth: professional.analytics?.views?.thisMonth || 0,
        viewsLastMonth: professional.analytics?.views?.lastMonth || 0,
        contactClicks: professional.analytics?.contactClicks || 0,
        searchImpressions: professional.analytics?.searchImpressions || 0,
      },
      reviews: {
        total: totalReviews,
        averageRating,
        pending: pendingReviews,
        recent: reviews.slice(0, 3).map((r) => ({
          _id: r._id.toString(),
          clientName: r.clientName,
          rating: r.rating,
          title: r.title,
          createdAt: r.createdAt,
        })),
      },
      inquiries: {
        total: totalInquiries,
        new: newInquiries,
        recent: inquiries.map((i) => ({
          _id: i._id.toString(),
          clientName: i.clientName,
          subject: i.subject,
          status: i.status,
          createdAt: i.createdAt,
        })),
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load dashboard data',
      },
      { status: 500 }
    );
  }
}

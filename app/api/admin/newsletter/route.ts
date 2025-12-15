/**
 * Admin Newsletter Management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { NewsletterSubscriberModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';
import { verifyAdminAuth } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return authResult.error;
    }

    await connectDBWithTimeout();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch subscribers
    const skip = (page - 1) * limit;
    const [subscribers, total] = await Promise.all([
      NewsletterSubscriberModel.find(filter)
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsletterSubscriberModel.countDocuments(filter),
    ]);

    return successResponse(
      {
        subscribers: subscribers.map((s) => ({
          _id: s._id.toString(),
          email: s.email,
          firstName: s.firstName,
          subscribed: s.subscribed,
          verified: s.verified,
          categories: s.categories || [],
          subscribedAt: s.subscribedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Subscribers fetched successfully'
    );
  } catch (error) {
    console.error('Newsletter admin fetch error:', error);
    return errorResponse('Failed to fetch subscribers', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return authResult.error;
    }

    await connectDBWithTimeout();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Subscriber ID is required', 400);
    }

    const result = await NewsletterSubscriberModel.findByIdAndDelete(id);

    if (!result) {
      return errorResponse('Subscriber not found', 404);
    }

    console.log(`✅ [Newsletter Admin] Subscriber deleted: ${id}`);

    return successResponse(
      { deletedId: id },
      'Subscriber removed successfully'
    );
  } catch (error) {
    console.error('Newsletter admin delete error:', error);
    return errorResponse('Failed to remove subscriber', 500);
  }
}

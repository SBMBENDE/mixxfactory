/**
 * GET /api/events/my-events - Get user's own submitted events
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const auth = await verifyAuth(req);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch user's events
    const events = await EventModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await EventModel.countDocuments({ userId });

    return NextResponse.json(
      {
        success: true,
        data: {
          events,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching user events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

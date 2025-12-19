/**
 * POST /api/events/:id/upgrade-tier - Upgrade event promotion tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const eventId = params.id;
    const body = await req.json();
    const { newTier } = body;

    // Validate tier
    if (!['free', 'featured', 'boost'].includes(newTier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid promotion tier' },
        { status: 400 }
      );
    }

    // Find event and verify ownership
    const event = await EventModel.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.userId?.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to modify this event' },
        { status: 403 }
      );
    }

    // Calculate new expiry date based on tier
    let promotionExpiryDate = null;
    if (newTier === 'featured') {
      // Featured: 1 week
      promotionExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (newTier === 'boost') {
      // Boost: 1 month
      promotionExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Update event
    event.promotionTier = newTier;
    event.promotionStartDate = new Date();
    event.promotionExpiryDate = promotionExpiryDate;
    event.featured = newTier === 'featured' || newTier === 'boost';

    await event.save();

    console.log(`✅ Event ${eventId} upgraded to ${newTier} tier`);

    return NextResponse.json(
      {
        success: true,
        data: event,
        message: `Event upgraded to ${newTier} tier`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error upgrading event tier:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upgrade tier' },
      { status: 500 }
    );
  }
}

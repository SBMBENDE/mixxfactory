/**
 * Admin SOS Support API
 * Fetch and manage SOS support tickets
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { SOSSupportModel } from '@/lib/db/models';
import { verifyAdminAuth } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/sos-support
 * Fetch all SOS support tickets
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid || !authResult.payload) {
      return authResult.error || NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch all tickets, sorted by priority and date
    const tickets = await SOSSupportModel.find({})
      .sort({ status: 1, priority: -1, createdAt: -1 })
      .lean()
      .exec();

    // Transform for response
    const transformedTickets = tickets.map(ticket => ({
      ...ticket,
      _id: ticket._id.toString(),
      professionalId: ticket.professionalId.toString(),
    }));

    return NextResponse.json({
      success: true,
      tickets: transformedTickets,
    });
  } catch (error) {
    console.error('[Admin SOS Support] Error fetching tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch support tickets',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

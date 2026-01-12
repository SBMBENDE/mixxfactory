/**
 * Professional SOS Tickets API
 * Fetch professional's own SOS tickets
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, SOSSupportModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

/**
 * GET /api/professional/sos-tickets
 * Fetch professional's own tickets
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;

    await connectDB();

    // Find professional profile
    const professional = await ProfessionalModel.findOne({ userId })
      .select('_id')
      .lean();

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Fetch their tickets (last 5)
    const tickets = await SOSSupportModel.find({ 
      professionalId: professional._id 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .exec();

    const transformedTickets = tickets.map(ticket => ({
      _id: ticket._id.toString(),
      reason: ticket.reason,
      message: ticket.message,
      status: ticket.status,
      priority: ticket.priority,
      adminNotes: ticket.adminNotes,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt,
    }));

    return NextResponse.json({
      success: true,
      tickets: transformedTickets,
    });
  } catch (error) {
    console.error('[Professional SOS Tickets] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tickets',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

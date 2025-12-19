/**
 * GET /api/events/[id] - Fetch single event
 * PUT /api/events/[id] - Update event (admin only)
 * DELETE /api/events/[id] - Delete event (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import mongoose from 'mongoose';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Check if valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await EventModel.findById(id).lean();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: event },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Check authentication
    const adminAuth = await verifyAdminAuth(req);
    const userAuth = adminAuth.isValid ? null : await verifyAuth(req);

    if (!adminAuth.isValid && !userAuth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const event = await EventModel.findById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // If user (not admin), verify ownership
    if (!adminAuth.isValid && event.userId?.toString() !== userAuth?.payload?.userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to modify this event' },
        { status: 403 }
      );
    }

    // Define editable fields based on user type
    const adminEditableFields = [
      'title', 'description', 'category', 'startDate', 'endDate', 'startTime', 'endTime',
      'location', 'posterImage', 'bannerImage', 'ticketing', 'ticketUrl', 'capacity',
      'organizer', 'highlights', 'tags', 'published', 'featured', 'promotionTier',
    ];

    const userEditableFields = [
      'title', 'description', 'category', 'startDate', 'endDate', 'startTime', 'endTime',
      'location', 'posterImage', 'bannerImage', 'ticketing', 'ticketUrl', 'capacity',
      'organizer', 'highlights', 'tags',
    ];

    const editableFields = adminAuth.isValid ? adminEditableFields : userEditableFields;

    // Update only allowed fields
    editableFields.forEach(field => {
      if (field in body && body[field] !== undefined) {
        (event as any)[field] = body[field];
      }
    });

    await event.save();

    return NextResponse.json(
      { success: true, data: event },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check authentication
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    const event = await EventModel.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

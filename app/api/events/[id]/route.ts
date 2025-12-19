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
import { validateVideoUrl } from '@/utils/videoValidation';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    let event;

    // Try to find by ObjectId first (for /my-events edit links)
    if (mongoose.Types.ObjectId.isValid(id)) {
      event = await EventModel.findById(id).lean();
    }

    // If not found by ID, try to find by slug (for event detail pages)
    if (!event) {
      event = await EventModel.findOne({ slug: id }).lean();
    }

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
      'location', 'posterImage', 'bannerImage', 'images', 'media', 'ticketing', 'ticketUrl', 'capacity',
      'organizer', 'highlights', 'tags', 'published', 'featured', 'promotionTier',
    ];

    const userEditableFields = [
      'title', 'description', 'category', 'startDate', 'endDate', 'startTime', 'endTime',
      'location', 'posterImage', 'bannerImage', 'images', 'media', 'ticketing', 'ticketUrl', 'capacity',
      'organizer', 'highlights', 'tags',
    ];

    const editableFields = adminAuth.isValid ? adminEditableFields : userEditableFields;

    // Validate and transform media if present
    if ('media' in body && Array.isArray(body.media)) {
      // If media contains objects with embedUrl, extract just the URLs
      // Otherwise, validate each URL
      body.media = body.media.map((item: any) => {
        // If it's a full video object with embedUrl, extract that
        if (typeof item === 'object' && item.embedUrl) {
          return item.embedUrl;
        }
        // If it's already a string (embed URL), return as-is
        if (typeof item === 'string') {
          return item;
        }
        // If it's a URL that needs validation, validate and get embedUrl
        if (typeof item === 'object' && item.url && !item.embedUrl) {
          const validated = validateVideoUrl(item.url);
          if (!validated) {
            throw new Error(`Invalid video URL: ${item.url}`);
          }
          return validated.embedUrl;
        }
        return item;
      });
    }

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
      { success: false, error: error.message || 'Failed to update event' },
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

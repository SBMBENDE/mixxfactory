/**
 * GET /api/events - Fetch events with optional filtering
 * POST /api/events - Create event (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { published: true };

    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Only show upcoming events by default (after today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query.startDate = { $gte: today };

    // Fetch events sorted by start date
    const events = await EventModel.find(query)
      .sort({ featured: -1, startDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await EventModel.countDocuments(query);

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
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // TODO: Verify admin role with JWT token

    const body = await req.json();

    // Validate required fields
    if (
      !body.title ||
      !body.description ||
      !body.startDate ||
      !body.startTime ||
      !body.endTime ||
      !body.posterImage ||
      !body.location?.venue ||
      !body.ticketing?.general ||
      !body.capacity ||
      !body.organizer?.name
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    let baseSlug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists and make it unique (max 50 attempts)
    let slug = baseSlug;
    let counter = 1;
    let maxAttempts = 50;
    let existingSlug = await EventModel.findOne({ slug }).lean();
    
    while (existingSlug && counter < maxAttempts) {
      slug = `${baseSlug}-${counter}`;
      existingSlug = await EventModel.findOne({ slug }).lean();
      counter++;
    }

    if (counter >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Could not generate unique slug for event' },
        { status: 400 }
      );
    }

    // Create event
    const event = new EventModel({
      ...body,
      slug,
      published: body.published || false,
    });

    await event.save();

    return NextResponse.json(
      { success: true, data: event },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating event:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `Event with this ${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

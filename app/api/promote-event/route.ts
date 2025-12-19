/**
 * POST /api/promote-event - User submits an event for promotion with pricing tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';
import { generateSlug } from '@/utils/slug';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const auth = await verifyAuth(req);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - please log in' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;
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
      !Array.isArray(body.ticketing) ||
      body.ticketing.length === 0 ||
      !body.ticketing.every((t: any) => t.label && typeof t.price === 'number' && t.price >= 0) ||
      !body.capacity ||
      body.capacity <= 0 ||
      !body.organizer?.name ||
      !body.category
    ) {
      console.log('❌ Validation failed. Missing or invalid fields:', {
        title: !!body.title,
        description: !!body.description,
        startDate: !!body.startDate,
        startTime: !!body.startTime,
        endTime: !!body.endTime,
        posterImage: !!body.posterImage,
        venue: !!body.location?.venue,
        ticketing: Array.isArray(body.ticketing) && body.ticketing.length > 0,
        capacity: body.capacity > 0,
        organizerName: !!body.organizer?.name,
        category: !!body.category,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: title, description, startDate, startTime, endTime, posterImage, venue, ticketing, capacity, organizer name, and category are all required'
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = generateSlug(body.title);

    // Check if slug exists and make it unique
    let counter = 1;
    let maxAttempts = 50;
    let existingSlug = await EventModel.findOne({ slug }).lean();
    
    while (existingSlug && counter < maxAttempts) {
      slug = `${generateSlug(body.title)}-${counter}`;
      existingSlug = await EventModel.findOne({ slug }).lean();
      counter++;
    }

    if (counter >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Could not generate unique slug for event' },
        { status: 400 }
      );
    }

    // Calculate promotion expiry date based on tier
    let promotionExpiryDate = null;
    if (body.pricingTier === 'featured') {
      // Featured: 1 week
      promotionExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (body.pricingTier === 'boost') {
      // Boost: 1 month
      promotionExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Create event with promotion tier info
    const event = new EventModel({
      title: body.title,
      slug,
      description: body.description,
      category: body.category,
      startDate: body.startDate,
      endDate: body.endDate,
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location,
      posterImage: body.posterImage,
      bannerImage: body.bannerImage || '',
      ticketing: body.ticketing,
      ticketUrl: body.ticketUrl || '',
      capacity: body.capacity,
      organizer: body.organizer,
      highlights: body.highlights || [],
      published: body.published || false,
      featured: body.pricingTier === 'featured' || body.pricingTier === 'boost',
      userId,
      promotionTier: body.pricingTier || 'free',
      promotionStartDate: new Date(),
      promotionExpiryDate,
    });

    await event.save();

    console.log('✅ Event created successfully:', event._id);

    return NextResponse.json(
      { 
        success: true, 
        data: event,
        message: 'Event submitted successfully! It will be visible once approved.'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error creating promoted event:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `Event with this ${field} already exists` },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      return NextResponse.json(
        { success: false, error: `Validation error: ${messages}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promote-event - User submits an event for promotion with pricing tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';
import { generateSlug } from '@/utils/slug';
import { validateVideoUrl } from '@/utils/videoValidation';

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

    // Define image limits per tier
    const IMAGE_LIMITS: { [key: string]: number } = {
      free: 1,
      featured: 5,
      boost: 10,
    };

    // Define video limits per tier
    const VIDEO_LIMITS: { [key: string]: number } = {
      free: 0,
      featured: 1,
      boost: 3,
    };

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

    // Validate image count for tier
    const tier = body.pricingTier || 'free';
    const imageLimit = IMAGE_LIMITS[tier] || 1;
    const imageCount = Array.isArray(body.images) ? body.images.length : 0;

    if (imageCount > imageLimit) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${tier} tier allows maximum ${imageLimit} image(s), but ${imageCount} were provided`
        },
        { status: 400 }
      );
    }

    // Validate video count and URLs for tier
    const videoLimit = VIDEO_LIMITS[tier] || 0;
    const videoCount = Array.isArray(body.media) ? body.media.length : 0;

    if (videoCount > videoLimit) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${tier} tier allows maximum ${videoLimit} video(s), but ${videoCount} were provided`
        },
        { status: 400 }
      );
    }

    // Validate each video URL format
    if (Array.isArray(body.media) && body.media.length > 0) {
      for (const video of body.media) {
        // Media should already be validated on client side, but validate again on server
        if (!video.url || !video.platform || !video.videoId || !video.embedUrl) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Invalid video data structure. Please ensure all videos are valid YouTube, Facebook, or Vimeo links.'
            },
            { status: 400 }
          );
        }
        
        // Verify the video data is valid
        const revalidated = validateVideoUrl(video.url);
        if (!revalidated) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Invalid video URL: ${video.url}`
            },
            { status: 400 }
          );
        }
      }
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
    let promotionExpiryDate: Date | undefined = undefined;
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
      images: Array.isArray(body.images) ? body.images : [],
      media: Array.isArray(body.media) ? body.media.map((v: any) => v.embedUrl) : [],
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

/**
 * POST /api/payment/verify-event-payment
 * Verifies Stripe payment and creates the event
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { generateSlug } from '@/utils/slug';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const auth = await verifyAuth(req);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sessionId, eventData } = body;

    if (!sessionId || !eventData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Verify the user matches
    if (session.metadata?.userId !== auth.payload.userId) {
      return NextResponse.json(
        { success: false, error: 'User mismatch' },
        { status: 403 }
      );
    }

    const tier = session.metadata?.tier || 'basic';

    // Check if an event was already created for this payment session
    const existingEvent = await EventModel.findOne({ paymentId: session.id }).lean();
    if (existingEvent) {
      console.log('⚠️ Event already exists for this payment session:', existingEvent._id);
      return NextResponse.json({
        success: true,
        data: existingEvent,
        message: 'Event already created for this payment.',
      });
    }

    // Generate slug from title
    let slug = generateSlug(eventData.title);

    // Check if slug exists and make it unique
    let counter = 1;
    let maxAttempts = 50;
    let existingSlug = await EventModel.findOne({ slug }).lean();
    
    while (existingSlug && counter < maxAttempts) {
      slug = `${generateSlug(eventData.title)}-${counter}`;
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
    if (tier === 'premium') {
      // Premium: 30 days
      promotionExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Create the event
    const event = new EventModel({
      title: eventData.title,
      slug,
      description: eventData.description,
      category: eventData.category,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      posterImage: eventData.posterImage,
      bannerImage: eventData.bannerImage || '',
      images: Array.isArray(eventData.images) ? eventData.images : [],
      media: Array.isArray(eventData.media) ? eventData.media.map((v: any) => v.embedUrl) : [],
      ticketing: eventData.ticketing,
      ticketUrl: eventData.ticketUrl || '',
      capacity: eventData.capacity,
      organizer: eventData.organizer,
      highlights: eventData.highlights || [],
      published: true,
      featured: tier === 'premium',
      userId: auth.payload.userId,
      promotionTier: tier,
      promotionStartDate: new Date(),
      promotionExpiryDate,
      paymentStatus: 'paid',
      paymentId: session.id,
      paymentAmount: session.amount_total ? session.amount_total / 100 : 0,
    });

    await event.save();

    console.log('✅ Event created successfully after payment:', event._id);

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event created successfully!',
    });
  } catch (error: any) {
    console.error('❌ Error verifying payment and creating event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

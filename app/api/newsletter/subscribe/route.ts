/**
 * Newsletter subscription API endpoint
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { NewsletterSubscriberModel } from '@/lib/db/models';
import { errorResponse, successResponse } from '@/utils/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  categories: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    await connectDBWithTimeout();

    const body = await request.json();

    // Validate input
    const validationResult = subscribeSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.errors[0].message, 400);
    }

    const { email, firstName, categories } = validationResult.data;

    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriberModel.findOne({ email });
    if (existingSubscriber && existingSubscriber.subscribed) {
      return errorResponse('Already subscribed with this email', 409);
    }

    // Create or update subscription
    let subscriber;
    if (existingSubscriber) {
      // Reactivate subscription
      subscriber = await NewsletterSubscriberModel.findByIdAndUpdate(
        existingSubscriber._id,
        {
          subscribed: true,
          subscribedAt: new Date(),
          unsubscribedAt: undefined,
          firstName,
          categories,
        },
        { new: true }
      );
    } else {
      // Create new subscription
      subscriber = await NewsletterSubscriberModel.create({
        email,
        firstName,
        subscribed: true,
        subscribedAt: new Date(),
        verified: true, // Auto-verify for now (can add email verification later)
        categories,
      });
    }

    console.log(`✅ [Newsletter] Subscriber added/updated: ${email}`);

    return successResponse(
      {
        email: subscriber.email,
        subscribed: subscriber.subscribed,
        firstName: subscriber.firstName,
      },
      'Successfully subscribed to newsletter!',
      201
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return errorResponse('Failed to subscribe to newsletter', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDBWithTimeout();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return errorResponse('Email parameter required', 400);
    }

    const subscriber = await NewsletterSubscriberModel.findOne({ email });

    if (!subscriber) {
      return errorResponse('Subscriber not found', 404);
    }

    return successResponse({
      email: subscriber.email,
      subscribed: subscriber.subscribed,
      verified: subscriber.verified,
      categories: subscriber.categories,
    });
  } catch (error) {
    console.error('Newsletter fetch error:', error);
    return errorResponse('Failed to fetch subscription status', 500);
  }
}

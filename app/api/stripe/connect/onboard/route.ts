/**
 * Stripe Connect Onboarding API Route
 * Creates a Stripe Connect account for event promoters to receive ticket sales revenue
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';
import { stripe } from '@/lib/payment/stripe';
import { errorResponse, successResponse } from '@/utils/api-response';

// Validation schema
const onboardSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  returnUrl: z.string().url('Valid return URL is required').optional(),
  refreshUrl: z.string().url('Valid refresh URL is required').optional(),
});

/**
 * POST /api/stripe/connect/onboard
 * Create or update Stripe Connect account link for event promoter
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const token = await getTokenFromRequest(req);
    if (!token) {
      return errorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse('Invalid token', 401);
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = onboardSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid request data',
        400
      );
    }

    const { eventId, returnUrl, refreshUrl } = parsed.data;

    // Connect to database
    await connectDB();

    // Find event and verify ownership
    const event = await EventModel.findById(eventId);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    if (event.userId?.toString() !== payload.userId) {
      return errorResponse('Unauthorized: You do not own this event', 403);
    }

    let accountId = event.stripeConnectedAccountId;

    // Create Stripe Connect account if it doesn't exist
    if (!accountId) {
      try {
        const account = await stripe.accounts.create({
          type: 'express', // Express account for quick onboarding
          country: 'BE', // Belgium (or detect from user profile)
          email: payload.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual', // Can be 'company' if needed
          metadata: {
            userId: payload.userId,
            eventId: eventId,
            eventTitle: event.title,
          },
        });

        accountId = account.id;

        // Save Stripe account ID to event
        event.stripeConnectedAccountId = accountId;
        await event.save();
      } catch (stripeError: any) {
        console.error('Stripe account creation error:', stripeError);
        return errorResponse(
          `Failed to create Stripe account: ${stripeError.message}`,
          500
        );
      }
    }

    // Generate account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url:
        refreshUrl || `${baseUrl}/my-events/${eventId}/connect-refresh`,
      return_url:
        returnUrl || `${baseUrl}/my-events/${eventId}/connect-success`,
      type: 'account_onboarding',
    });

    return successResponse({
      url: accountLink.url,
      accountId,
      expiresAt: accountLink.expires_at,
      message: 'Stripe Connect onboarding link created successfully',
    });
  } catch (error) {
    console.error('Stripe Connect onboarding error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Server error',
      500
    );
  }
}

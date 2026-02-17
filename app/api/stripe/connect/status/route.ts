/**
 * Stripe Connect Account Status API Route
 * Check if promoter's connected account is ready to receive payouts
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';
import { stripe } from '@/lib/payment/stripe';
import { errorResponse, successResponse } from '@/utils/api-response';

/**
 * GET /api/stripe/connect/status?eventId=xxx
 * Check Stripe Connect account status for an event
 */
export async function GET(req: NextRequest) {
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

    // Get eventId from query params
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return errorResponse('Event ID is required', 400);
    }

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

    // Check if connected account exists
    if (!event.stripeConnectedAccountId) {
      return successResponse({
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        message: 'No Stripe Connect account linked to this event',
      });
    }

    try {
      // Retrieve account details from Stripe
      const account = await stripe.accounts.retrieve(
        event.stripeConnectedAccountId
      );

      // Check if account is ready for transactions
      const chargesEnabled = account.charges_enabled || false;
      const payoutsEnabled = account.payouts_enabled || false;
      const detailsSubmitted = account.details_submitted || false;

      // Update ticketing enabled status if fully set up
      if (chargesEnabled && payoutsEnabled && !event.ticketingEnabled) {
        event.ticketingEnabled = true;
        await event.save();
      }

      return successResponse({
        connected: true,
        chargesEnabled,
        payoutsEnabled,
        detailsSubmitted,
        accountId: account.id,
        country: account.country,
        email: account.email,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          pastDue: account.requirements?.past_due || [],
          pendingVerification: account.requirements?.pending_verification || [],
        },
        message: chargesEnabled && payoutsEnabled
          ? 'Your account is fully connected and ready to receive payments'
          : 'Account setup incomplete. Please complete verification.',
      });
    } catch (stripeError: any) {
      console.error('Stripe account retrieval error:', stripeError);
      return errorResponse(
        `Failed to retrieve account status: ${stripeError.message}`,
        500
      );
    }
  } catch (error) {
    console.error('Connect status check error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Server error',
      500
    );
  }
}

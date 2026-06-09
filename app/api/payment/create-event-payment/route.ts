/**
 * POST /api/payment/create-event-payment
 * Creates a payment session for event promotion (basic/premium)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const EVENT_PRICES = {
  basic: 4.99,
  premium: 19.99,
};

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(req);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tier, provider, eventData } = body;

    if (!tier || !provider || !eventData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['basic', 'premium'].includes(tier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier' },
        { status: 400 }
      );
    }

    const price = EVENT_PRICES[tier as 'basic' | 'premium'];
    const duration = 'per event';
    const tierName = tier === 'basic' ? '🎫 Basic Event' : '⭐ Premium Event';

    if (provider === 'stripe') {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `${tierName} - ${eventData.title}`,
                description: `Event promotion ${duration}`,
              },
              unit_amount: Math.round(price * 100), // Convert to cents and round to avoid floating-point errors
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/event-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/event-payment?tier=${tier}`,
        metadata: {
          userId: auth.payload.userId,
          eventTitle: eventData.title,
          tier: tier,
          type: 'event_promotion',
        },
      });

      // Store event data temporarily associated with session
      // In production, you'd want to store this in a database
      // For now, we'll rely on session storage and handle it in the success page

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } else if (provider === 'paypal') {
      // PayPal integration would go here
      // For now, return error
      return NextResponse.json(
        { success: false, error: 'PayPal integration coming soon' },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid payment provider' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error creating event payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment session' },
      { status: 500 }
    );
  }
}

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for async payment updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db/connection';
import PaymentModel from '@/lib/db/payment-model';
import { verifyStripeWebhookSignature } from '@/lib/payment/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing signature');
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyStripeWebhookSignature(body, signature);
    } catch (error: any) {
      console.error('[Stripe Webhook] Signature verification failed:', error.message);
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // Connect to database
    await connectDB();

    // Handle different event types

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const { email, userId, tier } = intent.metadata || {};
        console.log('[Webhook] payment_intent.succeeded metadata:', { email, userId, tier });

        // Only allow 'starter' or 'pro' as valid tiers
        const allowedTiers = ['starter', 'pro'] as const;
        type Tier = (typeof allowedTiers)[number];
        const normalizedTier: Tier = allowedTiers.includes(tier as Tier) ? (tier as Tier) : 'pro';

        // Always upsert payment
        const upsertResult = await PaymentModel.findOneAndUpdate(
          { providerPaymentId: intent.id },
          {
            provider: 'stripe',
            providerPaymentId: intent.id,
            email,
            userId,
            status: 'succeeded',
            subscriptionTier: normalizedTier,
          },
          { upsert: true, new: true }
        );
        console.log('[Webhook] Payment upsert result:', upsertResult?._id);

        // Always attempt upgrade
        const { upgradeUser } = await import('@/lib/billing/upgradeUser');
        try {
          console.log('[Webhook] Calling upgradeUser...');
          await upgradeUser({ userId, email, tier: normalizedTier });
          console.log('[Webhook] upgradeUser completed');
        } catch (err) {
          console.error('[Stripe Webhook] Upgrade error:', err);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const { email, userId } = intent.metadata || {};
        await PaymentModel.findOneAndUpdate(
          { providerPaymentId: intent.id },
          {
            provider: 'stripe',
            providerPaymentId: intent.id,
            email,
            userId,
            status: 'failed',
            failureReason: intent.last_payment_error?.message || 'Payment failed',
          },
          { upsert: true, new: true }
        );
        break;
      }
      case 'payment_intent.canceled': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const { email, userId } = intent.metadata || {};
        await PaymentModel.findOneAndUpdate(
          { providerPaymentId: intent.id },
          {
            provider: 'stripe',
            providerPaymentId: intent.id,
            email,
            userId,
            status: 'canceled',
          },
          { upsert: true, new: true }
        );
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (!paymentIntentId) break;
        // Try to get metadata from payment
        const payment = await PaymentModel.findOne({ providerPaymentId: paymentIntentId });
        // Type guard for email
        const email = payment && typeof payment.get === 'function' ? payment.get('email') : undefined;
        const userId = payment && typeof payment.get === 'function' ? payment.get('userId') : undefined;
        await PaymentModel.findOneAndUpdate(
          { providerPaymentId: paymentIntentId },
          {
            status: 'refunded',
            refundReason: 'Refunded by admin or user request',
          },
          { upsert: true, new: true }
        );
        // Downgrade user to 'starter' (not 'free')
        const { upgradeUser } = await import('@/lib/billing/upgradeUser');
        try {
          await upgradeUser({ userId, email, tier: 'starter' });
        } catch (err) {
          console.error('[Stripe Webhook] Downgrade error:', err);
        }
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Removed unused handlePaymentSucceeded and handlePaymentFailed function declarations

// Removed unused handler function declarations and leftover throw error

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for async payment updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db/connection';
import PaymentModel from '@/lib/db/payment-model';
import { UserModel } from '@/lib/db/models';
import { verifyStripeWebhookSignature } from '@/lib/payment/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
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

        // Always upsert payment
        const upsertResult = await PaymentModel.findOneAndUpdate(
          { providerPaymentId: intent.id },
          {
            provider: 'stripe',
            providerPaymentId: intent.id,
            email,
            userId,
            status: 'succeeded',
            subscriptionTier: tier || 'pro',
          },
          { upsert: true, new: true }
        );
        console.log('[Webhook] Payment upsert result:', upsertResult?._id);

        // Always attempt upgrade
        const { upgradeUser } = await import('@/lib/billing/upgradeUser');
        try {
          console.log('[Webhook] Calling upgradeUser...');
          await upgradeUser({ userId, email, tier: tier || 'pro' });
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
        const paymentIntentId = charge.payment_intent;
        // Try to get metadata from payment
        const payment = await PaymentModel.findOne({ providerPaymentId: paymentIntentId });
        const { email, userId } = payment || {};
        await PaymentModel.findOneAndUpdate(
          { providerPaymentId: paymentIntentId },
          {
            status: 'refunded',
            refundReason: 'Refunded by admin or user request',
          },
          { upsert: true, new: true }
        );
        // Downgrade user
        const { upgradeUser } = await import('@/lib/billing/upgradeUser');
        try {
          await upgradeUser({ userId, email, tier: 'free' });
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

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await PaymentModel.findOne({ providerPaymentId: paymentIntent.id });
    
    if (!payment) {
      console.warn(`[Stripe Webhook] Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    payment.status = 'succeeded';
    await payment.save();

    // Upgrade user subscription
    const user = await UserModel.findById(payment.userId);
    if (user) {
      user.subscriptionTier = payment.subscriptionTier;
      await user.save();
      console.log(`[Stripe Webhook] User ${payment.userId} upgraded to ${payment.subscriptionTier}`);
      
      // Also update Professional model if exists
      const { ProfessionalModel } = await import('@/lib/db/models');
      const professional = await ProfessionalModel.findOne({ userId: payment.userId });
      if (professional) {
        professional.subscriptionTier = payment.subscriptionTier;
        await professional.save();
        console.log(`[Stripe Webhook] Professional profile upgraded to ${payment.subscriptionTier}`);
      }
    }

    console.log(`[Stripe Webhook] Payment ${payment._id} succeeded`);
  } catch (error: any) {
    console.error('[Stripe Webhook] Error handling payment success:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await PaymentModel.findOne({ providerPaymentId: paymentIntent.id });
    
    if (!payment) {
      console.warn(`[Stripe Webhook] Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    payment.status = 'failed';
    payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
    await payment.save();

    console.log(`[Stripe Webhook] Payment ${payment._id} failed: ${payment.failureReason}`);
  } catch (error: any) {
    console.error('[Stripe Webhook] Error handling payment failure:', error);
    throw error;
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const payment = await PaymentModel.findOne({ providerPaymentId: paymentIntent.id });
    
    if (!payment) {
      console.warn(`[Stripe Webhook] Payment not found for intent: ${paymentIntent.id}`);
      return;
    }

    payment.status = 'canceled';
    await payment.save();

    console.log(`[Stripe Webhook] Payment ${payment._id} canceled`);
  } catch (error: any) {
    console.error('[Stripe Webhook] Error handling payment cancellation:', error);
    throw error;
  }
}

async function handleRefund(charge: Stripe.Charge) {
  try {
    const payment = await PaymentModel.findOne({ providerPaymentId: charge.payment_intent });
    
    if (!payment) {
      console.warn(`[Stripe Webhook] Payment not found for charge: ${charge.id}`);
      return;
    }

    payment.status = 'refunded';
    payment.refundReason = 'Refunded by admin or user request';
    await payment.save();

    // Downgrade user subscription
    const user = await UserModel.findById(payment.userId);
    if (user) {
      user.subscriptionTier = 'free';
      await user.save();
      console.log(`[Stripe Webhook] User ${payment.userId} downgraded to free after refund`);
    }

    console.log(`[Stripe Webhook] Payment ${payment._id} refunded`);
  } catch (error: any) {
    console.error('[Stripe Webhook] Error handling refund:', error);
    throw error;
  }
}

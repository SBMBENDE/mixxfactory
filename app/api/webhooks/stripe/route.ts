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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
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

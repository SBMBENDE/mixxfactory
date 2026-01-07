/**
 * PayPal Webhook Handler
 * POST /api/webhooks/paypal
 * Handles PayPal webhook events for async payment updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db/connection';
import PaymentModel from '@/lib/db/payment-model';
import { UserModel } from '@/lib/db/models';
import { verifyPayPalWebhook } from '@/lib/payment/paypal';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = headers();

    // Get PayPal headers
    const paypalHeaders: Record<string, string> = {
      'paypal-transmission-id': headersList.get('paypal-transmission-id') || '',
      'paypal-transmission-time': headersList.get('paypal-transmission-time') || '',
      'paypal-cert-url': headersList.get('paypal-cert-url') || '',
      'paypal-auth-algo': headersList.get('paypal-auth-algo') || '',
      'paypal-transmission-sig': headersList.get('paypal-transmission-sig') || '',
    };

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook({
      webhookId: PAYPAL_WEBHOOK_ID,
      headers: paypalHeaders,
      body,
    });

    if (!isValid) {
      console.error('[PayPal Webhook] Signature verification failed');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[PayPal Webhook] Received event: ${body.event_type}`);

    // Connect to database
    await connectDB();

    // Handle different event types
    switch (body.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        await handlePaymentCompleted(body.resource);
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        await handlePaymentFailed(body.resource);
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        await handleRefund(body.resource);
        break;
      }

      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${body.event_type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('[PayPal Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(resource: any) {
  try {
    // Extract order ID from resource
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    
    if (!orderId) {
      console.warn('[PayPal Webhook] Order ID not found in resource');
      return;
    }

    const payment = await PaymentModel.findOne({ providerPaymentId: orderId });
    
    if (!payment) {
      console.warn(`[PayPal Webhook] Payment not found for order: ${orderId}`);
      return;
    }

    payment.status = 'succeeded';
    await payment.save();

    // Upgrade user subscription
    const user = await UserModel.findById(payment.userId);
    if (user) {
      user.subscriptionTier = payment.subscriptionTier;
      await user.save();
      console.log(`[PayPal Webhook] User ${payment.userId} upgraded to ${payment.subscriptionTier}`);
      
      // Also update Professional model if exists
      const { ProfessionalModel } = await import('@/lib/db/models');
      const professional = await ProfessionalModel.findOne({ userId: payment.userId });
      if (professional) {
        professional.subscriptionTier = payment.subscriptionTier;
        await professional.save();
        console.log(`[PayPal Webhook] Professional profile upgraded to ${payment.subscriptionTier}`);
      }
    }

    console.log(`[PayPal Webhook] Payment ${payment._id} completed`);
  } catch (error: any) {
    console.error('[PayPal Webhook] Error handling payment completion:', error);
    throw error;
  }
}

async function handlePaymentFailed(resource: any) {
  try {
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    
    if (!orderId) {
      console.warn('[PayPal Webhook] Order ID not found in resource');
      return;
    }

    const payment = await PaymentModel.findOne({ providerPaymentId: orderId });
    
    if (!payment) {
      console.warn(`[PayPal Webhook] Payment not found for order: ${orderId}`);
      return;
    }

    payment.status = 'failed';
    payment.failureReason = resource.status_details?.reason || 'Payment failed';
    await payment.save();

    console.log(`[PayPal Webhook] Payment ${payment._id} failed: ${payment.failureReason}`);
  } catch (error: any) {
    console.error('[PayPal Webhook] Error handling payment failure:', error);
    throw error;
  }
}

async function handleRefund(resource: any) {
  try {
    const orderId = resource.supplementary_data?.related_ids?.order_id;
    
    if (!orderId) {
      console.warn('[PayPal Webhook] Order ID not found in resource');
      return;
    }

    const payment = await PaymentModel.findOne({ providerPaymentId: orderId });
    
    if (!payment) {
      console.warn(`[PayPal Webhook] Payment not found for order: ${orderId}`);
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
      console.log(`[PayPal Webhook] User ${payment.userId} downgraded to free after refund`);
    }

    console.log(`[PayPal Webhook] Payment ${payment._id} refunded`);
  } catch (error: any) {
    console.error('[PayPal Webhook] Error handling refund:', error);
    throw error;
  }
}

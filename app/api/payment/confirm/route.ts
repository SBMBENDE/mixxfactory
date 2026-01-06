/**
 * Confirm Payment API Route
 * POST /api/payment/confirm
 * Confirms a payment after successful processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/connection';
import PaymentModel from '@/lib/db/payment-model';
import { getStripePaymentIntent } from '@/lib/payment/stripe';
import { capturePayPalOrder } from '@/lib/payment/paypal';
import { verifyToken } from '@/lib/auth/jwt';
import { UserModel } from '@/lib/db/models';

const confirmPaymentSchema = z.object({
  paymentId: z.string(),
  provider: z.enum(['stripe', 'paypal']),
  providerPaymentId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = confirmPaymentSchema.parse(body);

    // Connect to database
    await connectDB();

    // Find payment record
    const payment = await PaymentModel.findById(validatedData.paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify payment belongs to user
    if (payment.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to payment' },
        { status: 403 }
      );
    }

    console.log(`[Payment] Confirming ${validatedData.provider} payment: ${validatedData.providerPaymentId}`);

    let finalStatus: 'succeeded' | 'failed' = 'succeeded';
    let failureReason: string | undefined;

    if (validatedData.provider === 'stripe') {
      // Retrieve Stripe payment intent
      const stripeIntent = await getStripePaymentIntent(validatedData.providerPaymentId);

      if (stripeIntent.status === 'succeeded') {
        finalStatus = 'succeeded';
      } else if (['canceled', 'requires_payment_method'].includes(stripeIntent.status)) {
        finalStatus = 'failed';
        failureReason = stripeIntent.last_payment_error?.message || 'Payment failed';
      }
    } else {
      // Capture PayPal order
      const paypalOrder = await capturePayPalOrder(validatedData.providerPaymentId);

      if (paypalOrder.status === 'COMPLETED') {
        finalStatus = 'succeeded';
      } else {
        finalStatus = 'failed';
        failureReason = 'PayPal payment capture failed';
      }
    }

    // Update payment record
    payment.status = finalStatus;
    if (failureReason) {
      payment.failureReason = failureReason;
    }
    await payment.save();

    // If payment succeeded, upgrade user subscription
    if (finalStatus === 'succeeded') {
      const user = await UserModel.findById(decoded.userId);
      if (user) {
        user.subscriptionTier = payment.subscriptionTier;
        await user.save();
        console.log(`[Payment] User ${decoded.userId} upgraded to ${payment.subscriptionTier}`);
      }
    }

    console.log(`[Payment] Payment ${payment._id} status updated to ${finalStatus}`);

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment._id,
        status: finalStatus,
        amount: payment.amount,
        currency: payment.currency,
        subscriptionTier: payment.subscriptionTier,
      },
    });
  } catch (error: any) {
    console.error('[Payment API] Error confirming payment:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}

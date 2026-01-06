/**
 * Create Payment Intent API Route
 * POST /api/payment/create-intent
 * Creates a payment intent for Stripe or PayPal
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/connection';
import PaymentModel from '@/lib/db/payment-model';
import { createStripePaymentIntent, getOrCreateStripeCustomer } from '@/lib/payment/stripe';
import { createPayPalOrder } from '@/lib/payment/paypal';
import { verifyToken } from '@/lib/auth/jwt';

const createIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3).optional().default('usd'),
  provider: z.enum(['stripe', 'paypal']),
  subscriptionTier: z.enum(['free', 'basic', 'premium', 'enterprise']),
  professionalId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
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
    const validatedData = createIntentSchema.parse(body);

    // Connect to database
    await connectDB();

    console.log(`[Payment] Creating ${validatedData.provider} payment intent for user ${decoded.userId}`);

    let paymentIntent: any;
    let providerPaymentId: string;
    let clientSecret: string | undefined;

    if (validatedData.provider === 'stripe') {
      // Create Stripe customer
      const customer = await getOrCreateStripeCustomer({
        email: decoded.email,
        name: decoded.email, // Use email as name if name not available
        metadata: {
          userId: decoded.userId,
        },
      });

      // Create Stripe payment intent
      const stripeIntent = await createStripePaymentIntent({
        amount: validatedData.amount,
        currency: validatedData.currency,
        customerId: customer.id,
        metadata: {
          userId: decoded.userId,
          subscriptionTier: validatedData.subscriptionTier,
          professionalId: validatedData.professionalId || '',
          ...validatedData.metadata,
        },
        description: `${validatedData.subscriptionTier} subscription - MixxFactory`,
      });

      providerPaymentId = stripeIntent.id;
      clientSecret = stripeIntent.client_secret || undefined;
      paymentIntent = stripeIntent;
    } else {
      // Create PayPal order
      const paypalOrder = await createPayPalOrder({
        amount: validatedData.amount,
        currency: validatedData.currency,
        description: `${validatedData.subscriptionTier} subscription - MixxFactory`,
        metadata: {
          userId: decoded.userId,
          subscriptionTier: validatedData.subscriptionTier,
          professionalId: validatedData.professionalId || '',
          ...validatedData.metadata,
        },
      });

      providerPaymentId = paypalOrder.id;
      paymentIntent = paypalOrder;
    }

    // Create payment record in database
    const payment = await PaymentModel.create({
      userId: decoded.userId,
      professionalId: validatedData.professionalId,
      amount: validatedData.amount,
      currency: validatedData.currency.toUpperCase(),
      status: 'pending',
      provider: validatedData.provider,
      providerPaymentId,
      providerCustomerId: validatedData.provider === 'stripe' ? (paymentIntent as any).customer : undefined,
      subscriptionTier: validatedData.subscriptionTier,
      description: `${validatedData.subscriptionTier} subscription`,
      metadata: validatedData.metadata,
    });

    console.log(`[Payment] Payment record created: ${payment._id}`);

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment._id,
        providerPaymentId,
        clientSecret,
        amount: validatedData.amount,
        currency: validatedData.currency,
        provider: validatedData.provider,
      },
    });
  } catch (error: any) {
    console.error('[Payment API] Error creating payment intent:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

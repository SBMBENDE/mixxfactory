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
import { SUBSCRIPTION_PRICING } from '@/types/payment';

const createIntentSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional().default('usd'),
  provider: z.enum(['stripe', 'paypal']),
  subscriptionTier: z.enum(['free', 'starter', 'pro']),
  professionalId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      console.error('[Payment API] No auth_token cookie found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.error('[Payment API] Invalid token');
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createIntentSchema.parse(body);

    // Get amount from subscription tier if not provided
    const tierConfig = SUBSCRIPTION_PRICING.find(p => p.tier === validatedData.subscriptionTier);
    if (!tierConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const amount = validatedData.amount || tierConfig.price;

    // Don't allow payment for free tier
    if (amount === 0) {
      return NextResponse.json(
        { success: false, error: 'Free tier does not require payment' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    console.log(`[Payment] Creating ${validatedData.provider} payment intent for user ${decoded.userId}, tier: ${validatedData.subscriptionTier}, amount: $${amount}`);

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

      // Create Stripe payment intent (amount in cents)
      const stripeIntent = await createStripePaymentIntent({
        amount: Math.round(amount * 100), // Convert to cents
        currency: validatedData.currency,
        customerId: customer.id,
        metadata: {
          userId: decoded.userId,
          subscriptionTier: validatedData.subscriptionTier,
          professionalId: validatedData.professionalId || '',
          ...validatedData.metadata,
        },
        description: `${validatedData.subscriptionTier} subscription - Afrobizz`,
      });

      providerPaymentId = stripeIntent.id;
      clientSecret = stripeIntent.client_secret || undefined;
      paymentIntent = stripeIntent;
    } else {
      // Create PayPal order
      const paypalOrder = await createPayPalOrder({
        amount: amount, // PayPal uses actual dollar amount
        currency: validatedData.currency,
        description: `${validatedData.subscriptionTier} subscription - Afrobizz`,
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
      amount: amount,
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
        orderId: validatedData.provider === 'paypal' ? providerPaymentId : undefined,
        amount: amount,
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

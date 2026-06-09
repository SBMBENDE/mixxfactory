/**
 * Stripe Payment Configuration and Utilities
 * Secure server-side Stripe integration
 */

import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required in environment variables');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export stripe getter for backward compatibility
export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => {
    return getStripe()[prop as keyof Stripe];
  }
});

// Stripe webhook secret for signature verification
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Create a Stripe payment intent
 */
export async function createStripePaymentIntent(params: {
  amount: number;
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  description?: string;
}): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency || 'eur',
      customer: params.customerId,
      metadata: params.metadata || {},
      description: params.description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error: any) {
    console.error('[Stripe] Payment intent creation failed:', error);
    throw new Error(`Stripe payment intent creation failed: ${error.message}`);
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateStripeCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: params.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata || {},
    });

    return customer;
  } catch (error: any) {
    console.error('[Stripe] Customer creation failed:', error);
    throw new Error(`Stripe customer creation failed: ${error.message}`);
  }
}

/**
 * Retrieve a payment intent
 */
export async function getStripePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error: any) {
    console.error('[Stripe] Payment intent retrieval failed:', error);
    throw new Error(`Stripe payment intent retrieval failed: ${error.message}`);
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelStripePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (error: any) {
    console.error('[Stripe] Payment intent cancellation failed:', error);
    throw new Error(`Stripe payment intent cancellation failed: ${error.message}`);
  }
}

/**
 * Create a refund
 */
export async function createStripeRefund(params: {
  paymentIntentId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}): Promise<Stripe.Refund> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: params.paymentIntentId,
      amount: params.amount ? Math.round(params.amount * 100) : undefined,
      reason: params.reason,
    });

    return refund;
  } catch (error: any) {
    console.error('[Stripe] Refund creation failed:', error);
    throw new Error(`Stripe refund creation failed: ${error.message}`);
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );

    return event;
  } catch (error: any) {
    console.error('[Stripe] Webhook signature verification failed:', error);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

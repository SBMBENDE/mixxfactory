/**
 * Stripe Connect Webhook Handler
 * Handles Stripe events for ticket purchases and connected accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { stripe } from '@/lib/payment/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/stripe/webhooks/connect
 * Handle Stripe Connect webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const eventId = session.metadata?.eventId;
    const ticketType = session.metadata?.ticketType;
    const quantity = parseInt(session.metadata?.quantity || '1');

    if (!eventId || !ticketType) {
      console.error('Missing metadata in checkout session');
      return;
    }

    // Update event attendees and ticket quantity
    const event = await EventModel.findById(eventId);

    if (!event) {
      console.error(`Event not found: ${eventId}`);
      return;
    }

    // Update attendees count
    event.attendees += quantity;

    // Update ticket quantity if specified
    const ticketIndex = event.ticketing.findIndex((t) => t.label === ticketType);
    if (ticketIndex !== -1 && event.ticketing[ticketIndex].quantity !== undefined) {
      event.ticketing[ticketIndex].quantity! -= quantity;
    }

    await event.save();

    console.log(
      `Updated event ${eventId}: Added ${quantity} attendees for ${ticketType}`
    );
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const eventId = paymentIntent.metadata?.eventId;
    
    if (!eventId) {
      return;
    }

    const event = await EventModel.findById(eventId);
    if (event) {
      // Track payment success (could be used for analytics)
      console.log(
        `Payment succeeded for event ${event.title}: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`
      );
    }
  } catch (error) {
    console.error('Error handling payment intent:', error);
  }
}

/**
 * Handle Stripe Connect account updates
 */
async function handleAccountUpdated(account: Stripe.Account) {
  try {
    const accountId = account.id;

    // Find events using this connected account
    const events = await EventModel.find({
      stripeConnectedAccountId: accountId,
    });

    // Update ticketing enabled status based on account verification
    const chargesEnabled = account.charges_enabled || false;
    const payoutsEnabled = account.payouts_enabled || false;
    const ticketingEnabled = chargesEnabled && payoutsEnabled;

    for (const event of events) {
      if (event.ticketingEnabled !== ticketingEnabled) {
        event.ticketingEnabled = ticketingEnabled;
        await event.save();
        console.log(
          `Updated event ${event._id}: ticketingEnabled = ${ticketingEnabled}`
        );
      }
    }
  } catch (error) {
    console.error('Error handling account update:', error);
  }
}

/**
 * Handle charge refunds (restore ticket inventory)
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const paymentIntent = charge.payment_intent;
    
    if (!paymentIntent || typeof paymentIntent === 'string') {
      return;
    }

    const eventId = paymentIntent.metadata?.eventId;
    const ticketType = paymentIntent.metadata?.ticketType;
    const quantity = parseInt(paymentIntent.metadata?.quantity || '1');

    if (!eventId || !ticketType) {
      return;
    }

    const event = await EventModel.findById(eventId);

    if (!event) {
      return;
    }

    // Restore attendees count
    event.attendees = Math.max(0, event.attendees - quantity);

    // Restore ticket quantity
    const ticketIndex = event.ticketing.findIndex((t) => t.label === ticketType);
    if (ticketIndex !== -1 && event.ticketing[ticketIndex].quantity !== undefined) {
      event.ticketing[ticketIndex].quantity! += quantity;
    }

    await event.save();

    console.log(
      `Refund processed for event ${eventId}: Restored ${quantity} tickets for ${ticketType}`
    );
  } catch (error) {
    console.error('Error handling charge refund:', error);
  }
}

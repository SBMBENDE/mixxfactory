/**
 * Stripe Webhook Handler
 * Listens for checkout.session.completed to confirm ticket purchases.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/db/connection';
import { TicketPurchaseModel, EventModel } from '@/lib/db/models';
import { sendTicketConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-12-15.clover' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await connectDB();

      // Confirm the pending ticket purchase
      const purchase = await TicketPurchaseModel.findOneAndUpdate(
        { stripeSessionId: session.id },
        {
          status: 'confirmed',
          stripePaymentIntentId: session.payment_intent as string,
        },
        { new: true }
      );

      if (purchase) {
        // Decrement ticket stock if applicable
        const quantity = purchase.quantity;
        await EventModel.updateOne(
          { _id: purchase.eventId, 'ticketing.label': purchase.ticketType },
          { $inc: { 'ticketing.$.quantity': -quantity, attendees: quantity } }
        );

        // Send confirmation email (non-blocking — don't fail webhook on email error)
        sendTicketConfirmationEmail({
          customerEmail: purchase.customerEmail,
          customerName: purchase.customerName,
          eventTitle: purchase.eventTitle,
          eventSlug: purchase.eventSlug,
          ticketType: purchase.ticketType,
          quantity: purchase.quantity,
          totalAmount: purchase.totalAmount,
          currency: purchase.currency,
          ticketCode: purchase.ticketCode,
        }).catch((err) => console.error('[Webhook] Email send failed:', err));

        console.log(`[Webhook] Confirmed ticket purchase ${purchase.ticketCode} for ${purchase.eventTitle}`);
      } else {
        console.warn('[Webhook] No pending purchase found for session:', session.id);
      }
    } catch (err) {
      console.error('[Webhook] DB error:', err);
      // Still return 200 to avoid Stripe retrying
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await connectDB();
      await TicketPurchaseModel.updateOne(
        { stripeSessionId: session.id, status: 'pending' },
        { status: 'cancelled' }
      );
    } catch (err) {
      console.error('[Webhook] Cancel error:', err);
    }
  }

  return NextResponse.json({ received: true });
}

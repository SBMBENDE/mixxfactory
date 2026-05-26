/**
 * Event Ticket Checkout API Route
 * Creates Stripe Checkout session — payments go to the Afrobizz platform account.
 * A TicketPurchase record is created (pending) immediately; confirmed via Stripe webhook.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { connectDB } from '@/lib/db/connection';
import { EventModel, TicketPurchaseModel } from '@/lib/db/models';
import { stripe } from '@/lib/payment/stripe';
import { errorResponse, successResponse } from '@/utils/api-response';

// Validation schema
const checkoutSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  ticketType: z.string().min(1, 'Ticket type is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 tickets per purchase'),
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().min(1, 'Customer name is required'),
});

/**
 * POST /api/stripe/tickets/checkout
 * Create Stripe Checkout session; all payments go to Afrobizz platform account.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return errorResponse('Invalid request data', 400);

    const { eventId, ticketType, quantity, customerEmail, customerName } = parsed.data;

    await connectDB();

    const event = await EventModel.findById(eventId);
    if (!event) return errorResponse('Event not found', 404);
    if (!event.published) return errorResponse('Event is not published', 400);
    if (!event.ticketing?.length) return errorResponse('No tickets configured for this event', 400);

    const ticketOption = event.ticketing.find((t: any) => t.label === ticketType);
    if (!ticketOption) return errorResponse('Ticket type not found', 400);

    // Check remaining stock (undefined/null = unlimited)
    if (ticketOption.quantity != null && ticketOption.quantity < quantity) {
      return errorResponse(`Only ${ticketOption.quantity} tickets remaining`, 400);
    }

    const unitPrice = ticketOption.price ?? 0;
    const totalAmount = unitPrice * quantity;
    const currency = (ticketOption.currency || 'EUR').toLowerCase();
    const ticketCode = `TKT-${randomUUID().toUpperCase().slice(0, 8)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // ── Free tickets ─────────────────────────────────────────────────────────
    if (unitPrice === 0) {
      await TicketPurchaseModel.create({
        eventId: event._id,
        eventTitle: event.title,
        eventSlug: event.slug,
        ticketType,
        quantity,
        unitPrice: 0,
        totalAmount: 0,
        currency: currency.toUpperCase(),
        customerEmail,
        customerName,
        stripeSessionId: `free-${randomUUID()}`,
        ticketCode,
        status: 'confirmed',
      });
      return successResponse({ url: `${baseUrl}/events/${event.slug}/ticket-success?code=${ticketCode}` });
    }

    // ── Paid tickets via Stripe ───────────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: eventId,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${event.title} — ${ticketOption.label}`,
              description: `${quantity} × ${ticketOption.label}`,
              images: event.posterImage ? [event.posterImage] : [],
            },
            unit_amount: Math.round(unitPrice * 100),
          },
          quantity,
        },
      ],
      success_url: `${baseUrl}/events/${event.slug}/ticket-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/events/${event.slug}?checkout=cancelled`,
      metadata: {
        eventId: eventId,
        eventTitle: event.title,
        eventSlug: event.slug,
        ticketType,
        quantity: quantity.toString(),
        customerEmail,
        customerName,
        ticketCode,
        unitPrice: unitPrice.toString(),
        totalAmount: totalAmount.toString(),
        currency: currency.toUpperCase(),
      },
    });

    // Pre-create a pending purchase — webhook will confirm it on payment
    await TicketPurchaseModel.create({
      eventId: event._id,
      eventTitle: event.title,
      eventSlug: event.slug,
      ticketType,
      quantity,
      unitPrice,
      totalAmount,
      currency: currency.toUpperCase(),
      customerEmail,
      customerName,
      stripeSessionId: session.id,
      ticketCode,
      status: 'pending',
    });

    return successResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('[Ticket Checkout]', error);
    if (error.type === 'StripeInvalidRequestError') {
      return errorResponse(`Stripe error: ${error.message}`, 400);
    }
    return errorResponse(error instanceof Error ? error.message : 'Server error', 500);
  }
}

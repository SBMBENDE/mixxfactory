/**
 * Event Ticket Checkout API Route
 * Creates Stripe Checkout session with automatic revenue splitting
 * Basic events: 5% to Afrobizz, 95% to promoter
 * Premium/Featured events: 3% to Afrobizz, 97% to promoter
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { stripe } from '@/lib/payment/stripe';
import { errorResponse, successResponse } from '@/utils/api-response';

// Validation schema
const checkoutSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  ticketType: z.string().min(1, 'Ticket type is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 tickets per purchase'),
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().min(1, 'Customer name is required').optional(),
});

/**
 * POST /api/stripe/tickets/checkout
 * Create Stripe Checkout session for event tickets with revenue splitting
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Invalid request data',
        400
      );
    }

    const { eventId, ticketType, quantity, customerEmail, customerName } = parsed.data;

    // Connect to database
    await connectDB();

    // Find event
    const event = await EventModel.findById(eventId);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    if (!event.published) {
      return errorResponse('Event is not published', 400);
    }

    // Check if ticketing is enabled (Stripe Connect account verified)
    if (!event.ticketingEnabled || !event.stripeConnectedAccountId) {
      return errorResponse(
        'Ticketing not enabled for this event. Promoter must complete Stripe Connect setup.',
        400
      );
    }

    // Find the specific ticket type
    const ticketOption = event.ticketing.find((t) => t.label === ticketType);

    if (!ticketOption) {
      return errorResponse('Invalid ticket type', 400);
    }

    // Check ticket availability
    if (ticketOption.quantity !== undefined && ticketOption.quantity < quantity) {
      return errorResponse(
        `Only ${ticketOption.quantity} tickets remaining`,
        400
      );
    }

    // Check event capacity
    if (event.attendees + quantity > event.capacity) {
      return errorResponse(
        `Event capacity exceeded. Only ${event.capacity - event.attendees} spots remaining`,
        400
      );
    }

    // Calculate pricing with commission
    const ticketPrice = ticketOption.price; // Price in EUR
    const totalTicketAmount = ticketPrice * quantity; // Total ticket revenue
    
    // Determine commission rate based on promotion tier
    let commissionRate = event.ticketingCommissionRate || 5; // Default 5%
    
    // Override based on tier
    if (event.promotionTier === 'premium') {
      commissionRate = 3; // Premium events get 3% rate
    }

    // Calculate commission amount
    const commissionAmount = Math.round(totalTicketAmount * 100 * (commissionRate / 100)); // in cents
    const netAmount = Math.round(totalTicketAmount * 100) - commissionAmount; // Promoter receives this

    // Prepare line items for Stripe Checkout
    const lineItems = [
      {
        price_data: {
          currency: ticketOption.currency.toLowerCase() || 'eur',
          product_data: {
            name: `${event.title} - ${ticketOption.label}`,
            description: `${quantity} x ${ticketOption.label} ticket(s)`,
            images: event.posterImage ? [event.posterImage] : [],
            metadata: {
              eventId: eventId,
              eventTitle: event.title,
              ticketType: ticketOption.label,
            },
          },
          unit_amount: Math.round(ticketPrice * 100), // Convert to cents
        },
        quantity,
      },
    ];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout session with destination charges
    // This automatically splits revenue between platform and connected account
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      client_reference_id: eventId,
      success_url: `${baseUrl}/events/${event.slug}/ticket-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/events/${event.slug}?checkout=cancelled`,
      metadata: {
        eventId: eventId,
        eventTitle: event.title,
        ticketType: ticketOption.label,
        quantity: quantity.toString(),
        customerEmail,
        customerName: customerName || 'Guest',
        commissionRate: commissionRate.toString(),
      },
      payment_intent_data: {
        application_fee_amount: commissionAmount, // Platform fee in cents
        transfer_data: {
          destination: event.stripeConnectedAccountId, // Promoter's account
        },
        metadata: {
          eventId: eventId,
          eventTitle: event.title,
          ticketType: ticketOption.label,
          quantity: quantity.toString(),
          commissionRate: commissionRate.toString(),
        },
      },
    });

    return successResponse({
      sessionId: session.id,
      url: session.url,
      totalAmount: totalTicketAmount,
      commissionAmount: commissionAmount / 100, // Convert back to EUR
      netAmount: netAmount / 100, // Convert back to EUR
      commissionRate,
      message: 'Checkout session created successfully',
    });
  } catch (error: any) {
    console.error('Ticket checkout error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return errorResponse(
        `Stripe error: ${error.message}`,
        400
      );
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Server error',
      500
    );
  }
}

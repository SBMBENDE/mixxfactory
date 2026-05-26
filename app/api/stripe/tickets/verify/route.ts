/**
 * Ticket Verify API
 * Returns ticket purchase details by Stripe session ID or ticket code.
 * Used by the success page to display confirmation info.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { TicketPurchaseModel } from '@/lib/db/models';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const code = searchParams.get('code');

  if (!sessionId && !code) {
    return NextResponse.json({ error: 'Provide session_id or code' }, { status: 400 });
  }

  try {
    await connectDB();

    const filter = sessionId ? { stripeSessionId: sessionId } : { ticketCode: code };
    const purchase = await TicketPurchaseModel.findOne(filter).lean();

    if (!purchase) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      ticketCode: purchase.ticketCode,
      eventTitle: purchase.eventTitle,
      eventSlug: purchase.eventSlug,
      ticketType: purchase.ticketType,
      quantity: purchase.quantity,
      totalAmount: purchase.totalAmount,
      currency: purchase.currency,
      customerName: purchase.customerName,
      customerEmail: purchase.customerEmail,
      status: purchase.status,
      createdAt: purchase.createdAt,
    });
  } catch (err) {
    console.error('[Ticket Verify]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

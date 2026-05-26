import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { TicketPurchaseModel } from '@/lib/db/models';
import { verifyAdminAuth } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const filter: Record<string, unknown> = {};
    if (status && ['pending', 'confirmed', 'cancelled', 'refunded'].includes(status)) {
      filter.status = status;
    }

    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          createdAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          toDate.setHours(23, 59, 59, 999);
          createdAt.$lte = toDate;
        }
      }
      if (Object.keys(createdAt).length > 0) {
        filter.createdAt = createdAt;
      }
    }

    const purchases = await TicketPurchaseModel.find(filter)
      .sort({ createdAt: -1 })
      .select(
        'createdAt eventTitle eventSlug ticketType quantity unitPrice totalAmount currency customerName customerEmail status ticketCode stripeSessionId stripePaymentIntentId checkedIn checkedInAt'
      )
      .lean();

    const header = [
      'createdAt',
      'eventTitle',
      'eventSlug',
      'ticketType',
      'quantity',
      'unitPrice',
      'totalAmount',
      'currency',
      'customerName',
      'customerEmail',
      'status',
      'ticketCode',
      'stripeSessionId',
      'stripePaymentIntentId',
      'checkedIn',
      'checkedInAt',
    ];

    const rows = purchases.map((purchase: any) => [
      purchase.createdAt ? new Date(purchase.createdAt).toISOString() : '',
      purchase.eventTitle,
      purchase.eventSlug,
      purchase.ticketType,
      purchase.quantity,
      purchase.unitPrice,
      purchase.totalAmount,
      purchase.currency,
      purchase.customerName,
      purchase.customerEmail,
      purchase.status,
      purchase.ticketCode,
      purchase.stripeSessionId,
      purchase.stripePaymentIntentId || '',
      purchase.checkedIn ? 'true' : 'false',
      purchase.checkedInAt ? new Date(purchase.checkedInAt).toISOString() : '',
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ticket-purchases-${stamp}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Admin Ticket Export]', error);
    return NextResponse.json({ success: false, error: 'Failed to export ticket purchases' }, { status: 500 });
  }
}

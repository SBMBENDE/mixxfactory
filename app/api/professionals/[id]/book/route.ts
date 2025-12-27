import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BookingModel, AvailabilityModel, BlockedTimeModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

// POST: Create a new booking (client)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const professionalId = params.id;
    const body = await request.json();
    const { service, start, end } = body;
    // Optionally require auth for client
    let clientId = null;
    try {
      const auth = await verifyAuth(request);
      if (auth?.payload) clientId = auth.payload.userId;
    } catch {}
    // 1. Check availability and prevent double-booking
    const overlap = await BookingModel.findOne({
      professionalId,
      start: { $lt: new Date(end) },
      end: { $gt: new Date(start) },
      status: { $in: ['pending', 'confirmed'] },
    });
    if (overlap) {
      return NextResponse.json({ success: false, error: 'Slot already booked' }, { status: 409 });
    }
    // 2. Check for block
    const block = await BlockedTimeModel.findOne({
      professionalId,
      start: { $lt: new Date(end) },
      end: { $gt: new Date(start) },
    });
    if (block) {
      return NextResponse.json({ success: false, error: 'Slot is blocked' }, { status: 409 });
    }
    // 3. Create booking
    const booking = await BookingModel.create({
      professionalId,
      clientId,
      service,
      start: new Date(start),
      end: new Date(end),
      status: 'pending',
    });
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Booking POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BookingModel, AvailabilityModel, BlockedTimeModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

// GET: Compute available slots for a professional on a given date
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const professionalId = params.id;
    const url = new URL(request.url);
    const dateStr = url.searchParams.get('date'); // YYYY-MM-DD
    const durationMinutes = parseInt(url.searchParams.get('duration') || '60');
    if (!dateStr) {
      return NextResponse.json({ success: false, error: 'Missing date' }, { status: 400 });
    }
    const date = new Date(dateStr);
    // 1. Get availability
    const availability = await AvailabilityModel.findOne({ professionalId }).lean();
    if (!availability) {
      return NextResponse.json({ success: false, error: 'No availability set' }, { status: 404 });
    }
    // 2. Get bookings and blocks for the day
    const dayStart = new Date(dateStr + 'T00:00:00Z');
    const dayEnd = new Date(dateStr + 'T23:59:59Z');
    const [bookings, blocks] = await Promise.all([
      BookingModel.find({ professionalId, start: { $lt: dayEnd }, end: { $gt: dayStart }, status: { $in: ['pending', 'confirmed'] } }).lean(),
      BlockedTimeModel.find({ professionalId, start: { $lt: dayEnd }, end: { $gt: dayStart } }).lean(),
    ]);
    // 3. Generate slots
    const slots = generateSlotsForDay(date, availability, bookings, blocks, durationMinutes);
    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error('Slots GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to compute slots' }, { status: 500 });
  }
}

// Slot generation logic
function generateSlotsForDay(
  date: Date,
  availability: any,
  bookings: any[],
  blocks: any[],
  durationMinutes: number
) {
  // Only generate for available days
  const dayOfWeek = date.getUTCDay();
  if (!availability.days.includes(dayOfWeek)) return [];
  // Parse start/end time
  const [startHour, startMin] = availability.startTime.split(':').map(Number);
  const [endHour, endMin] = availability.endTime.split(':').map(Number);
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), startHour, startMin));
  const dayEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), endHour, endMin));
  const buffer = availability.bufferMinutes || 0;
  const slots = [];
  let slotStart = new Date(dayStart);
  while (slotStart.getTime() + durationMinutes * 60000 <= dayEnd.getTime()) {
    let slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
    // Check for overlap with bookings/blocks
    const overlaps = [...bookings, ...blocks].some(b =>
      (slotStart < b.end && slotEnd > b.start)
    );
    // Check for exceptions
    const isException = (availability.exceptions || []).some(e => {
      const exDate = new Date(e.date);
      return exDate.getUTCFullYear() === date.getUTCFullYear() &&
        exDate.getUTCMonth() === date.getUTCMonth() &&
        exDate.getUTCDate() === date.getUTCDate();
    });
    // Minimum notice (24h) and max advance (30d)
    const now = new Date();
    const minNotice = 24 * 60 * 60000;
    const maxAdvance = 30 * 24 * 60 * 60000;
    if (
      !overlaps &&
      !isException &&
      slotStart.getTime() - now.getTime() >= minNotice &&
      slotStart.getTime() - now.getTime() <= maxAdvance
    ) {
      slots.push({ start: slotStart, end: slotEnd });
    }
    // Move to next slot (add buffer)
    slotStart = new Date(slotEnd.getTime() + buffer * 60000);
  }
  return slots;
}

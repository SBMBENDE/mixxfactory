import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BookingModel, AvailabilityModel, BlockedTimeModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

// GET: Professional calendar overview (bookings, blocks, availability)
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.payload.userId;
    await connectDB();
    // Find professionalId
    const professionalId = await getProfessionalIdForUser(userId);
    if (!professionalId) {
      return NextResponse.json({ success: false, error: 'Professional profile not found' }, { status: 404 });
    }
    // Fetch all bookings, blocks, and availability
    const [bookings, blocks, availability] = await Promise.all([
      BookingModel.find({ professionalId }).lean(),
      BlockedTimeModel.find({ professionalId }).lean(),
      AvailabilityModel.findOne({ professionalId }).lean(),
    ]);
    return NextResponse.json({ success: true, data: { bookings, blocks, availability } });
  } catch (error) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load calendar' }, { status: 500 });
  }
}

// Helper: get professionalId for user
async function getProfessionalIdForUser(userId: string) {
  const { ProfessionalModel } = await import('@/lib/db/models');
  const prof = await ProfessionalModel.findOne({ userId }).select('_id');
  return prof?._id;
}

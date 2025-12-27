import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { AvailabilityModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

// GET: Get current availability
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.payload.userId;
    await connectDB();
    const professionalId = await getProfessionalIdForUser(userId);
    if (!professionalId) {
      return NextResponse.json({ success: false, error: 'Professional profile not found' }, { status: 404 });
    }
    const availability = await AvailabilityModel.findOne({ professionalId }).lean();
    return NextResponse.json({ success: true, data: availability });
  } catch (error) {
    console.error('Availability GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load availability' }, { status: 500 });
  }
}

// POST: Set/update availability
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = auth.payload.userId;
    await connectDB();
    const professionalId = await getProfessionalIdForUser(userId);
    if (!professionalId) {
      return NextResponse.json({ success: false, error: 'Professional profile not found' }, { status: 404 });
    }
    const body = await request.json();
    const updated = await AvailabilityModel.findOneAndUpdate(
      { professionalId },
      { ...body, professionalId },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Availability POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update availability' }, { status: 500 });
  }
}

// Helper: get professionalId for user
async function getProfessionalIdForUser(userId: string) {
  const { ProfessionalModel } = await import('@/lib/db/models');
  const prof = await ProfessionalModel.findOne({ userId }).select('_id');
  return prof?._id;
}

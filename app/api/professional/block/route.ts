import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BlockedTimeModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

// GET: List all blocked times for the professional
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
    const blocks = await BlockedTimeModel.find({ professionalId }).lean();
    return NextResponse.json({ success: true, data: blocks });
  } catch (error) {
    console.error('BlockedTime GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load blocked times' }, { status: 500 });
  }
}

// POST: Block a new time range
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
    const block = await BlockedTimeModel.create({ ...body, professionalId });
    return NextResponse.json({ success: true, data: block });
  } catch (error) {
    console.error('BlockedTime POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to block time' }, { status: 500 });
  }
}

// Helper: get professionalId for user
async function getProfessionalIdForUser(userId: string) {
  const { ProfessionalModel } = await import('@/lib/db/models');
  const prof = await ProfessionalModel.findOne({ userId }).select('_id');
  return prof?._id;
}

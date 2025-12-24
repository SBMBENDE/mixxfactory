/**
 * Mark Inquiry as Read API
 * POST - Mark inquiry as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, InquiryModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;
    await connectDB();

    const professional = await ProfessionalModel.findOne({ userId });
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    const inquiry = await InquiryModel.findOneAndUpdate(
      { _id: params.id, professionalId: professional._id },
      { status: 'read' },
      { new: true }
    );

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update inquiry',
      },
      { status: 500 }
    );
  }
}

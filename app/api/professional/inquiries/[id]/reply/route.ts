/**
 * Reply to Inquiry API
 * POST - Send reply to inquiry
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
    const body = await request.json();
    const { reply } = body;

    if (!reply || !reply.trim()) {
      return NextResponse.json(
        { success: false, error: 'Reply text is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const professional = await ProfessionalModel.findOne({ userId });
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    const inquiry = await InquiryModel.findOne({
      _id: params.id,
      professionalId: professional._id,
    });

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // Add reply
    inquiry.replies.push({
      text: reply,
      timestamp: new Date(),
      from: 'professional',
    } as any);
    inquiry.status = 'replied';
    await inquiry.save();

    // TODO: Send email notification to client

    return NextResponse.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error('Reply error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send reply',
      },
      { status: 500 }
    );
  }
}

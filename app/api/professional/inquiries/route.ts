/**
 * Professional Inquiries API
 * GET - Fetch professional's inquiries
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, InquiryModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    await connectDB();

    const professional = await ProfessionalModel.findOne({ userId });
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    let query: any = { professionalId: professional._id };
    if (filter === 'new') {
      query.status = 'new';
    } else if (filter === 'replied') {
      query.status = { $in: ['replied', 'read'] };
    }

    const inquiries = await InquiryModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error('Inquiries API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load inquiries',
      },
      { status: 500 }
    );
  }
}

/**
 * Professional Profile API
 * GET - Fetch authenticated professional's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
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

    await connectDB();

    const professional = await ProfessionalModel.findOne({ userId }).populate('category');

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: professional,
    });
  } catch (error) {
    console.error('My Profile API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load profile',
      },
      { status: 500 }
    );
  }
}

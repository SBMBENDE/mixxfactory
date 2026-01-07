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

    // Get user's email verification status and subscription tier
    const { UserModel } = await import('@/lib/db/models');
    const user = await UserModel.findById(userId).select('emailVerified subscriptionTier');
    
    // Use the most recent subscriptionTier (prefer User model as source of truth)
    const subscriptionTier = user?.subscriptionTier || professional.subscriptionTier || 'free';
    
    // Combine professional data with email verification status and subscription
    const profileData = {
      ...professional.toObject(),
      verified: user?.emailVerified || false, // Use email verification status
      subscriptionTier, // Ensure we use the latest tier
    };

    return NextResponse.json({
      success: true,
      data: profileData,
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

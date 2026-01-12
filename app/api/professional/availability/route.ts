/**
 * API route for updating professional availability calendar
 * PUT /api/professional/availability
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(req);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;
    const { availability } = await req.json();

    if (!availability || typeof availability !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid availability data' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find professional by userId
    const professional = await ProfessionalModel.findOne({ userId });

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Check if user has Pro subscription
    if (professional.subscriptionTier !== 'pro') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Availability calendar is a Pro-only feature. Please upgrade to Pro.',
          requiresUpgrade: true
        },
        { status: 403 }
      );
    }

    // Update availability
    professional.availability = availability;
    await professional.save();

    // Convert Map to plain object for response
    let savedAvailability = {};
    if (professional.availability) {
      if (professional.availability instanceof Map) {
        savedAvailability = Object.fromEntries(professional.availability);
      } else if (typeof professional.availability === 'object') {
        savedAvailability = professional.availability;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      data: { availability: savedAvailability },
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}

// GET availability for a professional
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const professional = await ProfessionalModel.findOne({ userId: auth.payload.userId });

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Convert Map to plain object
    let availability = {};
    if (professional.availability) {
      if (professional.availability instanceof Map) {
        availability = Object.fromEntries(professional.availability);
      } else if (typeof professional.availability === 'object') {
        availability = professional.availability;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        availability,
        subscriptionTier: professional.subscriptionTier,
      },
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

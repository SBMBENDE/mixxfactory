/**
 * Update User Profile Endpoint
 * PATCH /api/users/profile
 * Updates user profile information and tracks completion
 */

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models';
import { verifyJWT } from '@/lib/auth/jwt';
import { connectDB } from '@/lib/db/connection';
import { z } from 'zod';

// Validation schema
const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  profilePicture: z.string().url().optional(),
}).strict();

/**
 * Calculate profile completion percentage
 */
function calculateProfileCompletion(profileCompletion: any): number {
  const fields = [
    profileCompletion.basicInfo,
    profileCompletion.contactInfo,
    profileCompletion.profilePicture,
    profileCompletion.preferences,
  ];
  const completedCount = fields.filter(Boolean).length;
  return Math.round((completedCount / fields.length) * 100);
}

export async function PATCH(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update profile fields
    const updates = validation.data;
    if (updates.firstName !== undefined) {
      user.firstName = updates.firstName;
      user.profileCompletion.basicInfo = true;
    }
    if (updates.lastName !== undefined) {
      user.lastName = updates.lastName;
      user.profileCompletion.basicInfo = true;
    }
    if (updates.phone !== undefined) {
      user.phone = updates.phone;
      user.profileCompletion.contactInfo = true;
    }
    if (updates.profilePicture !== undefined) {
      user.profilePicture = updates.profilePicture;
      user.profileCompletion.profilePicture = true;
    }

    // Update completion percentage
    user.profileCompletionPercentage = calculateProfileCompletion(user.profileCompletion);

    await user.save();

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || null,
          profilePicture: user.profilePicture || null,
          profileCompletion: user.profileCompletion,
          profileCompletionPercentage: user.profileCompletionPercentage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || null,
          profilePicture: user.profilePicture || null,
          email: user.email,
          accountType: user.accountType,
          profileCompletion: user.profileCompletion,
          profileCompletionPercentage: user.profileCompletionPercentage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * Update User Preferences Endpoint
 * PATCH /api/auth/preferences
 * Updates account settings and user preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models';
import { verifyJWT } from '@/lib/auth/jwt';
import { connectDB } from '@/lib/db/connection';
import { z } from 'zod';

// Validation schema
const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  language: z.enum(['en', 'fr']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  twoFactorEnabled: z.boolean().optional(),
}).strict();

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
    const validation = updatePreferencesSchema.safeParse(body);
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

    // Update preferences
    const updates = validation.data;
    if (updates.emailNotifications !== undefined) {
      user.preferences.emailNotifications = updates.emailNotifications;
    }
    if (updates.smsNotifications !== undefined) {
      user.preferences.smsNotifications = updates.smsNotifications;
    }
    if (updates.marketingEmails !== undefined) {
      user.preferences.marketingEmails = updates.marketingEmails;
    }
    if (updates.language !== undefined) {
      user.preferences.language = updates.language;
    }
    if (updates.theme !== undefined) {
      user.preferences.theme = updates.theme;
    }
    if (updates.twoFactorEnabled !== undefined) {
      user.preferences.twoFactorEnabled = updates.twoFactorEnabled;
    }

    await user.save();

    return NextResponse.json(
      {
        message: 'Preferences updated successfully',
        preferences: user.preferences,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

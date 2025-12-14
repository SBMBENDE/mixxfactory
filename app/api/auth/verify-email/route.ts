/**
 * Email Verification Endpoint
 * POST /api/auth/verify-email
 * Validates email verification token and marks user as verified
 */

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models';
import { hashToken } from '@/lib/auth/password';
import { connectDB } from '@/lib/db/connection';
import { z } from 'zod';

// Validation schema
const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(64, 'Invalid verification token'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = verifyEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, token } = validation.data;

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }

    // Verify token exists
    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      return NextResponse.json(
        { error: 'No verification token found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > user.emailVerificationExpires) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      return NextResponse.json(
        { error: 'Verification token has expired. Please register again.' },
        { status: 400 }
      );
    }

    // Verify token matches
    const hashedProvidedToken = hashToken(token);
    if (hashedProvidedToken !== user.emailVerificationToken) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json(
      {
        message: 'Email verified successfully! You can now login.',
        user: {
          id: user._id,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}

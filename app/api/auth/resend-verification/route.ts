/**
 * Resend Email Verification Endpoint
 * POST /api/auth/resend-verification
 * Generates a new verification token and sends it to the user
 */

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models';
import { generateEmailVerificationToken, hashToken } from '@/lib/auth/password';
import { connectDB } from '@/lib/db/connection';
import { z } from 'zod';

// Validation schema
const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = resendVerificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal whether email exists (security best practice)
    if (!user) {
      return NextResponse.json(
        {
          message: 'If an account exists with this email, a verification link has been sent.',
        },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          message: 'This email is already verified. You can login now.',
        },
        { status: 200 }
      );
    }

    // Generate new verification token
    const { token, hashedToken, expiresAt } = generateEmailVerificationToken();

    // Update user with new token
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = expiresAt;
    await user.save();

    // TODO: Send verification email
    // When email service is configured, construct verification URL:
    // const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    // await sendVerificationEmail(email, user.firstName, verificationUrl);

    console.log(`[DEV] Verification token for ${email}: ${token}`);
    console.log(`[DEV] Token expires at: ${expiresAt}`);

    return NextResponse.json(
      {
        message: 'If an account exists with this email, a verification link has been sent.',
        // TODO: Remove in production (for testing only)
        ...(process.env.NODE_ENV === 'development' && {
          verificationLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`,
          token,
          expiresAt,
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}

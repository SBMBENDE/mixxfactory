/**
 * Forgot Password Endpoint
 * POST /api/auth/forgot-password
 * Request body: { email: string }
 * Generates password reset token and sends email (when email service is configured)
 */

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models';
import { generatePasswordResetToken, hashToken } from '@/lib/auth/password';
import { connectDB } from '@/lib/db/connection';
import { z } from 'zod';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
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

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal whether email exists in system (security best practice)
    if (!user) {
      return NextResponse.json(
        {
          message: 'If an account exists with this email, a password reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const { token, hashedToken, expiresAt } = generatePasswordResetToken();

    // Update user with reset token
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await user.save();

    // TODO: Send password reset email
    // When email service is configured, construct reset URL:
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${email}`;
    // await sendPasswordResetEmail(email, user.firstName, resetUrl);

    console.log(`[DEV] Password reset token for ${email}: ${token}`);
    console.log(`[DEV] Reset token expires at: ${expiresAt}`);

    return NextResponse.json(
      {
        message: 'If an account exists with this email, a password reset link has been sent.',
        // TODO: Remove in production (for testing only)
        ...(process.env.NODE_ENV === 'development' && { token, expiresAt }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

/**
 * Reset Password Endpoint
 * POST /api/auth/reset-password
 * Request body: { email: string, token: string, newPassword: string, confirmPassword: string }
 * Validates reset token and updates password
 */

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models';
import { hashPassword, hashToken } from '@/lib/auth/password';
import { connectDB } from '@/lib/db/connection';
import { z } from 'zod';

// Validation schema
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(64, 'Invalid reset token'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, token, newPassword } = validation.data;

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or reset token' },
        { status: 400 }
      );
    }

    // Verify reset token exists and is not expired
    if (!user.passwordResetToken || !user.passwordResetExpires) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > user.passwordResetExpires) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify token matches
    const hashedProvidedToken = hashToken(token);
    if (hashedProvidedToken !== user.passwordResetToken) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Hash new password and update user
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return NextResponse.json(
      {
        message: 'Password reset successful. You can now login with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

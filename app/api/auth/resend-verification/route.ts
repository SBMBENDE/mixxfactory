/**
 * Resend Email Verification Endpoint
 * POST /api/auth/resend-verification
 * Generates a new verification token and sends it to the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models';
import { generateEmailVerificationToken } from '@/lib/auth/password';
import { connectDB } from '@/lib/db/connection';
import { sendEmail, getVerificationEmailHTML } from '@/lib/email/sendgrid';
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
    const user = await UserModel.findOne({ email: email.toLowerCase() });

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

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    try {
      const firstName = user.firstName || email.split('@')[0];
      const emailHTML = getVerificationEmailHTML(firstName, verificationUrl);
      await sendEmail({
        to: email,
        subject: 'Verify Your MixxFactory Email',
        html: emailHTML,
      });
      console.log(`[Auth] Verification email resent to ${email}`);
    } catch (emailError) {
      console.warn('[Auth] Email sending failed:', emailError);
      // Continue - don't fail the request
    }

    console.log(`[DEV] Verification token for ${email}: ${token}`);
    console.log(`[DEV] Token expires at: ${expiresAt}`);

    return NextResponse.json(
      {
        message: 'If an account exists with this email, a verification link has been sent.',
        // Remove in production (for testing only)
        ...(process.env.NODE_ENV === 'development' && {
          verificationLink: verificationUrl,
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

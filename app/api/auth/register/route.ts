/**
 * Register API route
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { registerSchema } from '@/lib/validations';
import { hashPassword, generateEmailVerificationToken } from '@/lib/auth/password';
import { generateToken, setAuthCookieHeader } from '@/lib/auth/jwt';
import { errorResponse, validationErrorResponse } from '@/utils/api-response';
import { sendEmail, getVerificationEmailHTML } from '@/lib/email/sendgrid';
import { createSession, getDeviceInfoFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDBWithTimeout();

    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { email, password, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return errorResponse('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const { token: verificationToken, hashedToken, expiresAt } = generateEmailVerificationToken();

    // Create user
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      accountType: role || 'professional', // Default to professional
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expiresAt,
      emailVerified: false, // Email not verified until token is confirmed
    });

    // Create session for this device
    const deviceInfo = getDeviceInfoFromRequest(request);
    const sessionId = await createSession(
      user._id.toString(),
      deviceInfo.userAgent,
      request.headers.get('accept-language') || undefined,
      deviceInfo.ipAddress
    );

    // Generate token with session ID
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.accountType,
      sessionId,
    });

    // Send verification email (required before users can access professional registration)
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(verificationToken)}`;
    try {
      console.log('[Auth] SendGrid API Key present:', !!process.env.SENDGRID_API_KEY);
      console.log('[Auth] Generating verification email for:', email);
      const firstName = email.split('@')[0]; // Use part of email as fallback
      const emailHTML = getVerificationEmailHTML(firstName, verificationUrl);
      console.log('[Auth] Sending email via SendGrid...');
      await sendEmail({
        to: email,
        subject: 'Verify Your MixxFactory Email',
        html: emailHTML,
      });
      console.log(`✅ [Auth] Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ [Auth] Email sending failed:', emailError);
      // Log the error but allow registration to proceed
      // Users can resend verification email if needed
      console.warn('[Auth] Email sending failed but registration continues (users can resend from resend-verification page):', emailError);
    }

    // Create response with auth cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          userId: user._id.toString(),
          email: user.email,
          role: user.accountType,
          token,
          emailVerified: user.emailVerified,
          verificationToken, // Include token for redirect
        },
        message: 'Registration successful! Please verify your email.',
      },
      { status: 201 }
    );

    // Set cookie header
    response.headers.set('Set-Cookie', setAuthCookieHeader(token));
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Internal server error', 500);
  }
}

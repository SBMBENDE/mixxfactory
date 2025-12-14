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
      role: role || 'professional', // Default to professional
      emailVerificationToken: hashedToken,
      emailVerificationExpires: expiresAt,
      emailVerified: false, // Email not verified until token is confirmed
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Create response with auth cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          token,
          emailVerified: user.emailVerified,
        },
        message: 'Registration successful! Please verify your email.',
        // In development, include verification link for testing
        ...(process.env.NODE_ENV === 'development' && {
          verificationLink: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`,
        }),
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

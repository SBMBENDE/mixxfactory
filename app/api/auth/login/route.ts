/**
 * Login API route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { loginSchema } from '@/lib/validations';
import { comparePassword } from '@/lib/auth/password';
import { generateToken, setAuthCookieHeader } from '@/lib/auth/jwt';
import { errorResponse, validationErrorResponse } from '@/utils/api-response';
import { createSession, getDeviceInfoFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[API /api/auth/login] Login attempt started');
    await connectDBWithTimeout();

    const body = await request.json();
    console.log('[API /api/auth/login] Request body email:', body.email);

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('[API /api/auth/login] Validation failed');
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user || !user.password) {
      console.log('[API /api/auth/login] User not found:', email);
      return errorResponse('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log('[API /api/auth/login] Password invalid for user:', email);
      return errorResponse('Invalid email or password', 401);
    }

    console.log('[API /api/auth/login] Credentials valid for user:', email);

    // Create session for this device
    const deviceInfo = getDeviceInfoFromRequest(request);
    const sessionId = await createSession(
      user._id.toString(),
      deviceInfo.userAgent,
      request.headers.get('accept-language') || undefined,
      deviceInfo.ipAddress
    );


    // Always set role: 'professional' for professional users
    let role = (user as any).role;
    if ((user as any).accountType === 'professional' || (user as any).role === 'professional') {
      role = 'professional';
    }
    // Generate token with session ID
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role,
      sessionId,
    });

    console.log('[API /api/auth/login] Generated new token for user:', email);

    // Create response with auth cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          userId: user._id.toString(),
          email: user.email,
          role: user.accountType,
          token,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );

    // Set cookie using BOTH methods for maximum compatibility
    // Method 1: Using Next.js cookies() API
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    console.log('[API /api/auth/login] Cookie set via cookies() API');
    
    // Method 2: Also set via response header for extra compatibility
    const cookieHeader = setAuthCookieHeader(token);
    console.log('[API /api/auth/login] Setting cookie header via response');
    response.headers.append('Set-Cookie', cookieHeader);
    
    console.log('[API /api/auth/login] Login successful for:', email);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

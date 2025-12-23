/**
 * Login API route
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { loginSchema } from '@/lib/validations';
import { comparePassword } from '@/lib/auth/password';
import { generateToken, setAuthCookieHeader } from '@/lib/auth/jwt';
import { errorResponse, validationErrorResponse } from '@/utils/api-response';

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

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.accountType,
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

    // Set cookie header
    const cookieHeader = setAuthCookieHeader(token);
    console.log('[API /api/auth/login] Setting cookie header');
    response.headers.set('Set-Cookie', cookieHeader);
    
    console.log('[API /api/auth/login] Login successful for:', email);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

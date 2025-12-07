/**
 * Login API route
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { loginSchema } from '@/lib/validations';
import { comparePassword } from '@/lib/auth/password';
import { generateToken, setAuthCookieHeader } from '@/lib/auth/jwt';
import { errorResponse, validationErrorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

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
        },
        message: 'Login successful',
      },
      { status: 200 }
    );

    // Set cookie header
    response.headers.set('Set-Cookie', setAuthCookieHeader(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}

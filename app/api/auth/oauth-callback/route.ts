/**
 * OAuth Callback Handler
 * Bridges NextAuth OAuth with custom JWT auth system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { generateToken } from '@/lib/auth/jwt';
import { createSession, getDeviceInfoFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No OAuth session found' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDBWithTimeout();

    // Find user
    const user = await UserModel.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create session for this device
    const deviceInfo = getDeviceInfoFromRequest(request);
    const sessionId = await createSession(
      user._id.toString(),
      deviceInfo.userAgent,
      request.headers.get('accept-language') || undefined,
      deviceInfo.ipAddress
    );

    // Generate custom JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.accountType,
      sessionId,
    });

    // Create response with auth cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[OAuth Callback] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

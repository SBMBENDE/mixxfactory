/**
 * OAuth Callback Handler
 * Bridges NextAuth OAuth with custom JWT auth system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { generateToken } from '@/lib/auth/jwt';
import { createSession, getDeviceInfoFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[OAuth Callback API] Starting bridge process...');
    
    // Get NextAuth JWT token from cookie instead of session
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    });
    
    console.log('[OAuth Callback API] NextAuth token:', {
      hasToken: !!token,
      email: token?.email,
      provider: token?.provider,
    });
    
    if (!token || !token.email) {
      console.error('[OAuth Callback API] No token or email found');
      return NextResponse.json(
        { success: false, error: 'No OAuth session found' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDBWithTimeout();
    console.log('[OAuth Callback API] Connected to database');

    // Find user
    const user = await UserModel.findOne({ email: token.email });
    
    console.log('[OAuth Callback API] User lookup:', {
      email: token.email,
      found: !!user,
      userId: user?._id.toString(),
    });
    
    if (!user) {
      console.error('[OAuth Callback API] User not found in database');
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

    console.log('[OAuth Callback API] Session created:', sessionId);

    // Generate custom JWT token
    const authToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.accountType,
      sessionId,
    });

    console.log('[OAuth Callback API] Token generated, setting cookie');

    // Create response with auth cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    console.log('[OAuth Callback API] Cookie set, returning success');

    return response;
  } catch (error) {
    console.error('[OAuth Callback API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[OAuth Callback API] Error details:', { errorMessage, errorStack });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

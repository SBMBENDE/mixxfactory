/**
 * Google OAuth Callback Handler
 * Handles: /api/auth/oauth/google/callback?code=...&state=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/db/models';
import {
  exchangeGoogleCode,
  getGoogleUserProfile,
  parseGoogleIdToken,
} from '@/lib/auth/oauth-callback';
import { generateToken } from '@/lib/auth/jwt';
import { validateOAuthConfig } from '@/lib/auth/oauth';
import { connectDB } from '@/lib/db/connection';
import { createSession, getDeviceInfoFromRequest } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    // Check if OAuth is properly configured
    if (!validateOAuthConfig('google')) {
      return NextResponse.json(
        { error: 'Google OAuth is not configured' },
        { status: 500 }
      );
    }

    // Extract authorization code and state
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle authorization errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error';
      console.error('Google OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=oauth_failed&message=${encodeURIComponent(error)}`,
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is missing' },
        { status: 400 }
      );
    }

    if (!state) {
      return NextResponse.json(
        { error: 'State parameter is missing' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await exchangeGoogleCode(code);
    const { access_token, id_token } = tokenResponse;

    // Get user profile information
    let userProfile = await getGoogleUserProfile(access_token);

    // If ID token exists, try to extract additional info from it
    if (id_token) {
      const idTokenData = parseGoogleIdToken(id_token);
      userProfile = { ...userProfile, ...idTokenData };
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    let user = await UserModel.findOne({
      oauthProvider: 'google',
      oauthId: userProfile.sub,
    });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    } else {
      // Create new user from Google profile
      user = await UserModel.create({
        email: userProfile.email,
        firstName: userProfile.given_name || userProfile.name?.split(' ')[0] || 'User',
        lastName: userProfile.family_name || userProfile.name?.split(' ').slice(1).join(' ') || '',
        profilePicture: userProfile.picture || null,
        oauthProvider: 'google',
        oauthId: userProfile.sub,
        emailVerified: userProfile.email_verified || false,
        active: true,
        accountType: 'user',
        lastLogin: new Date(),
        profileCompletion: {
          basicInfo: false,
          contactInfo: false,
          profilePicture: !!userProfile.picture,
          preferences: false,
        },
        profileCompletionPercentage: userProfile.picture ? 25 : 0,
      });
    }

    // Create session for this device
    const deviceInfo = getDeviceInfoFromRequest(request);
    const sessionId = await createSession(
      user._id.toString(),
      deviceInfo.userAgent,
      request.headers.get('accept-language') || undefined,
      deviceInfo.ipAddress
    );

    // Generate JWT token with session ID
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.accountType,
      sessionId,
    });

    // Create response with redirect
    const response = NextResponse.redirect(
      new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL)
    );

    // Set JWT in httpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=callback_failed&message=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}

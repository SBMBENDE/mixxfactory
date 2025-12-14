/**
 * Facebook OAuth Callback Handler
 * Handles: /api/auth/oauth/facebook/callback?code=...&state=...
 */

import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models';
import {
  exchangeFacebookCode,
  getFacebookUserProfile,
} from '@/lib/auth/oauth-callback';
import { generateJWT } from '@/lib/auth/jwt';
import { validateOAuthConfig } from '@/lib/auth/oauth';
import { connectDB } from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Check if OAuth is properly configured
    if (!validateOAuthConfig('facebook')) {
      return NextResponse.json(
        { error: 'Facebook OAuth is not configured' },
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
      const errorReason = searchParams.get('error_reason') || 'Unknown error';
      const errorDescription = searchParams.get('error_description') || errorReason;
      console.error('Facebook OAuth error:', error, errorDescription);
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
    const tokenResponse = await exchangeFacebookCode(code);
    const { access_token } = tokenResponse;

    // Get user profile information
    const userProfile = await getFacebookUserProfile(access_token);

    if (!userProfile.email) {
      return NextResponse.redirect(
        new URL(
          '/auth/login?error=email_required&message=Facebook profile must have email access',
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    let user = await User.findOne({
      oauthProvider: 'facebook',
      oauthId: userProfile.id,
    });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    } else {
      // Create new user from Facebook profile
      const [firstName = 'User', ...lastNameParts] = userProfile.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      const profilePicture = userProfile.picture?.data?.url || null;

      user = await User.create({
        email: userProfile.email,
        firstName,
        lastName,
        profilePicture,
        oauthProvider: 'facebook',
        oauthId: userProfile.id,
        emailVerified: true, // Facebook doesn't require email verification
        active: true,
        accountType: 'user',
        lastLogin: new Date(),
        profileCompletion: {
          basicInfo: false,
          contactInfo: false,
          profilePicture: !!profilePicture,
          preferences: false,
        },
        profileCompletionPercentage: profilePicture ? 25 : 0,
      });
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user._id.toString(),
      email: user.email,
      accountType: user.accountType,
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
    console.error('Facebook OAuth callback error:', error);
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

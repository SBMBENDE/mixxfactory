/**
 * OAuth Authorization Initiation Endpoints
 * Generates authorization URLs and redirects to provider login
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOAuthAuthorizationUrl, validateOAuthConfig } from '@/lib/auth/oauth';
import crypto from 'crypto';

/**
 * Google OAuth login initiation
 * GET /api/auth/oauth/google/login
 */
export async function GET(request: NextRequest) {
  try {
    if (!validateOAuthConfig('google')) {
      return NextResponse.json(
        { error: 'Google OAuth is not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session/cookie for validation on callback
    const response = NextResponse.redirect(getOAuthAuthorizationUrl('google', state));
    response.cookies.set('oauth_state_google', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}

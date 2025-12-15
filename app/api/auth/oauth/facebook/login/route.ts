/**
 * Facebook OAuth Authorization Initiation
 * GET /api/auth/oauth/facebook/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOAuthAuthorizationUrl, validateOAuthConfig } from '@/lib/auth/oauth';
import crypto from 'crypto';

export async function GET() {
  try {
    if (!validateOAuthConfig('facebook')) {
      return NextResponse.json(
        { error: 'Facebook OAuth is not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session/cookie for validation on callback
    const response = NextResponse.redirect(getOAuthAuthorizationUrl('facebook', state));
    response.cookies.set('oauth_state_facebook', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Facebook OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Facebook OAuth' },
      { status: 500 }
    );
  }
}

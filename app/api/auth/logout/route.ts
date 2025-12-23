/**
 * Logout API route
 * Clears the auth_token cookie and session
 */

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('[API] /api/auth/logout called');
    
    // Clear the auth cookie
    await clearAuthCookie();
    console.log('[API] clearAuthCookie() completed');

    // Create response with cache prevention
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Prevent caching to ensure fresh response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API] Logout successful, returning 200');
    return response;
  } catch (error) {
    console.error('[API] Logout error:', error);
    
    // Still try to clear the cookie even on error
    try {
      await clearAuthCookie();
    } catch (e) {
      console.error('[API] Failed to clear cookie on error:', e);
    }
    
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out',
      },
      { status: 200 }
    );

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API] Returning 200 despite error');
    return response;
  }
}

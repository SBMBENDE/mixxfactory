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
    
    // Clear the auth cookie on the server
    await clearAuthCookie();
    console.log('[API] clearAuthCookie() completed');

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // CRITICAL: Set the Set-Cookie header to delete the cookie in the browser
    // We must explicitly set this header with Max-Age=0 to delete the cookie
    const deleteCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.log('[API] Setting Set-Cookie header to delete auth_token');
    response.headers.set('Set-Cookie', deleteCookie);
    
    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API] Logout response prepared with delete cookie header');
    return response;
  } catch (error) {
    console.error('[API] Logout error:', error);
    
    // Still try to clear the cookie even on error
    try {
      await clearAuthCookie();
      console.log('[API] clearAuthCookie() completed in error handler');
    } catch (e) {
      console.error('[API] Failed to clear cookie on error:', e);
    }
    
    // Return response with delete cookie header
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out',
      },
      { status: 200 }
    );

    const deleteCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    response.headers.set('Set-Cookie', deleteCookie);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API] Returning error response with delete cookie header');
    return response;
  }
}

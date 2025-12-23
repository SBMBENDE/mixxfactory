/**
 * Logout API route
 * Clears the auth_token cookie and session
 */

import { NextResponse } from 'next/server';
import { clearAuthCookie, getTokenFromRequest } from '@/lib/auth/jwt';
import { blacklistToken } from '@/lib/auth/logout-blacklist';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('[API] /api/auth/logout called');
    
    // Get the token from the request before clearing it
    const token = await getTokenFromRequest(request);
    if (token) {
      // Add token to blacklist so it's invalid even if cookie persists
      blacklistToken(token);
      console.log('[API] Token added to blacklist');
    }
    
    // Clear the auth cookie on the server
    await clearAuthCookie();
    console.log('[API] Auth cookie cleared');

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
    const deleteCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.log('[API] Setting Set-Cookie header to delete auth_token');
    response.headers.set('Set-Cookie', deleteCookie);
    
    // Force no caching
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    console.log('[API] Logout successful, returning 200');
    return response;
  } catch (error) {
    console.error('[API] Logout error:', error);
    
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
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    console.log('[API] Returning error response with delete cookie header');
    return response;
  }
}

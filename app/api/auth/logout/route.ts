/**
 * Logout API route
 * Clears the auth_token cookie and session
 */

import { NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/jwt';
import { blacklistToken } from '@/lib/auth/logout-blacklist';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('[API /api/auth/logout] /api/auth/logout called');
    
    // Get the token from the request before clearing it
    const token = await getTokenFromRequest(request);
    if (token) {
      // Add token to blacklist so it's invalid even if cookie persists
      await blacklistToken(token);
      console.log('[API /api/auth/logout] Token added to blacklist');
    }

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
    // Using Max-Age=0 and Expires in the past to ensure browser deletes it
    const deleteCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.log('[API /api/auth/logout] Setting Set-Cookie header to delete auth_token');
    console.log('[API /api/auth/logout] Delete cookie string:', deleteCookie);
    
    // Use append instead of set to ensure header is sent
    response.headers.append('Set-Cookie', deleteCookie);
    
    console.log('[API /api/auth/logout] After appending, response headers Set-Cookie:', response.headers.get('Set-Cookie'));
    
    // Force no caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API /api/auth/logout] Logout successful, returning 200');
    return response;
  } catch (error) {
    console.error('[API /api/auth/logout] Logout error:', error);
    
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out',
      },
      { status: 200 }
    );

    const deleteCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.log('[API /api/auth/logout] Error case: Setting Set-Cookie header (error case)');
    response.headers.append('Set-Cookie', deleteCookie);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API /api/auth/logout] Returning error response with delete cookie header');
    return response;
  }
}

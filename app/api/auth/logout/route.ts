/**
 * Logout API route
 * Clears the auth_token cookie and session
 */

import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getTokenFromRequest } from '@/lib/auth/jwt';
import { blacklistToken } from '@/lib/auth/logout-blacklist';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Log immediately to ensure this executes
  const logStart = new Date().toISOString();
  console.error(`\n${'='.repeat(60)}`);
  console.error(`[LOGOUT API] Started at ${logStart}`);
  console.error(`${'='.repeat(60)}\n`);
  
  try {
    console.log('[API /api/auth/logout] /api/auth/logout called');
    
    // Get the token from the request before clearing it
    const token = await getTokenFromRequest(request);
    console.log('[API /api/auth/logout] Token found:', token ? 'YES' : 'NO');
    
    if (token) {
      console.log('[API /api/auth/logout] Token to blacklist:', token.substring(0, 20) + '...');
      console.log('[API /api/auth/logout] Token length:', token.length);
      
      // Add token to blacklist so it's invalid even if cookie persists
      try {
        await blacklistToken(token);
        console.log('[API /api/auth/logout] Token successfully added to blacklist');
      } catch (blacklistError) {
        console.error('[API /api/auth/logout] Error adding token to blacklist:', blacklistError);
      }
    } else {
      console.log('[API /api/auth/logout] NO TOKEN FOUND - user might already be logged out');
    }

    // Delete the cookie using Next.js cookies API
    const cookieStore = await cookies();
    console.log('[API /api/auth/logout] Before delete - cookie exists:', !!cookieStore.get('auth_token'));
    cookieStore.delete('auth_token');
    console.log('[API /api/auth/logout] After delete - cookie should be cleared');

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // ALSO set explicit Set-Cookie header for maximum compatibility
    // Some clients/proxies may not respect the cookies() API
    const deleteCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.log('[API /api/auth/logout] Setting Set-Cookie header for browser');
    response.headers.append('Set-Cookie', deleteCookie);
    
    // Force no caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API /api/auth/logout] Logout successful, returning 200');
    return response;
  } catch (error) {
    console.error('[API /api/auth/logout] Logout error:', error);
    
    // Even on error, try to delete the cookie
    try {
      const cookieStore = await cookies();
      cookieStore.delete('auth_token');
      console.log('[API /api/auth/logout] Deleted auth_token cookie in error handler');
    } catch (cookieError) {
      console.error('[API /api/auth/logout] Error deleting cookie:', cookieError);
    }
    
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
    
    response.headers.append('Set-Cookie', deleteCookie);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('[API /api/auth/logout] Returning error response with delete cookie header');
    return response;
  }
}

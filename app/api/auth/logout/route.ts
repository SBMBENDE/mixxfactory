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
  try {
    console.error('[LOGOUT] ===== LOGOUT POST STARTED =====');
    console.error('[LOGOUT] Request headers:', Object.fromEntries(request.headers.entries()));
    console.error('[LOGOUT] Request cookies:', request.cookies.getAll());
    
    // Get the token from the request before clearing it
    const token = await getTokenFromRequest(request);
    console.error('[LOGOUT] Token extracted:', token ? 'YES' : 'NO');
    
    if (token) {
      console.error('[LOGOUT] Token to blacklist:', token.substring(0, 20) + '...');
      console.error('[LOGOUT] Token length:', token.length);
      console.error('[LOGOUT] Token type:', typeof token);
      
      // Add token to blacklist so it's invalid even if cookie persists
      try {
        console.error('[LOGOUT] Calling blacklistToken...');
        await blacklistToken(token);
        console.error('[LOGOUT] Token successfully added to blacklist');
      } catch (blacklistError) {
        console.error('[LOGOUT] EXCEPTION in blacklistToken:');
        console.error('[LOGOUT] Error:', blacklistError);
        console.error('[LOGOUT] Error type:', blacklistError instanceof Error ? blacklistError.constructor.name : typeof blacklistError);
        if (blacklistError instanceof Error) {
          console.error('[LOGOUT] Error message:', blacklistError.message);
        }
      }
    } else {
      console.error('[LOGOUT] NO TOKEN FOUND - user might already be logged out');
    }

    // Delete the cookie using Next.js cookies API
    const cookieStore = await cookies();
    console.error('[LOGOUT] Before delete - cookie exists:', !!cookieStore.get('auth_token'));
    cookieStore.delete('auth_token');
    console.error('[LOGOUT] After delete - cookie should be cleared');

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
    const deleteCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.error('[LOGOUT] Setting Set-Cookie header');
    response.headers.append('Set-Cookie', deleteCookie);
    
    // Force no caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.error('[LOGOUT] ===== LOGOUT POST COMPLETE - RETURNING 200 =====');
    return response;
  } catch (error) {
    console.error('[LOGOUT] ===== LOGOUT ERROR =====');
    console.error('[LOGOUT] Error:', error);
    console.error('[LOGOUT] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    if (error instanceof Error) {
      console.error('[LOGOUT] Error message:', error.message);
      console.error('[LOGOUT] Stack:', error.stack);
    }
    
    // Even on error, try to delete the cookie
    try {
      const cookieStore = await cookies();
      cookieStore.delete('auth_token');
      console.error('[LOGOUT] Deleted auth_token cookie in error handler');
    } catch (cookieError) {
      console.error('[LOGOUT] Error deleting cookie:', cookieError);
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
    
    console.error('[LOGOUT] ===== LOGOUT ERROR HANDLER RETURNING 200 =====');
    return response;
  }
}

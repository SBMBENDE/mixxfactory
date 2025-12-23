/**
 * Logout API route
 * Clears the auth_token cookie and session
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Delete the cookie on the server
    cookieStore.delete('auth_token');

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Set cookie to empty value with Max-Age=0 to delete from browser
    const emptyTokenCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    response.headers.set('Set-Cookie', emptyTokenCookie);
    
    // Prevent caching to ensure Set-Cookie header is processed
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still try to clear the cookie even on error
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out',
      },
      { status: 200 }
    );

    const emptyTokenCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    response.headers.set('Set-Cookie', emptyTokenCookie);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
}

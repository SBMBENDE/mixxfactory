/**
 * Logout API route
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🚪 [Logout API] POST /api/auth/logout called');
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('auth_token');
    console.log('🚪 [Logout API] Current token exists:', !!currentToken);
    
    // Delete the cookie on the server
    cookieStore.delete('auth_token');
    console.log('🚪 [Logout API] Cookie deleted from server-side store');

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Set multiple cookie deletion methods to ensure browser deletes it
    // Method 1: Set to empty with Max-Age=0
    const emptyTokenCookie = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.log('🚪 [Logout API] Setting Set-Cookie header with empty value and Max-Age=0');
    response.headers.set('Set-Cookie', emptyTokenCookie);
    
    // Also set Cache-Control to prevent caching of this response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    console.log('🚪 [Logout API] Returning 200 response');
    return response;
  } catch (error) {
    console.error('🚪 [Logout API] Error:', error);
    
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
    
    console.log('🚪 [Logout API] Returning 200 response (error case)');
    return response;
  }
}

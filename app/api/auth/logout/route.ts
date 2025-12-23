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

    // Explicitly clear the cookie in the browser response
    // Use empty value with Max-Age=0 to ensure deletion across all browsers
    const cookieHeader = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.log('🚪 [Logout API] Setting Set-Cookie header:', cookieHeader.substring(0, 50) + '...');
    response.headers.set('Set-Cookie', cookieHeader);
    
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

    const cookieHeader = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    response.headers.set('Set-Cookie', cookieHeader);
    console.log('🚪 [Logout API] Returning 200 response (error case)');
    return response;
  }
}

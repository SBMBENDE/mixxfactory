/**
 * Logout API route
 * Clears the auth_token cookie and session
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('[API] /api/auth/logout called');
    
    // Clear the auth cookie on the server side
    await clearAuthCookie();
    console.log('[API] clearAuthCookie() completed');
    
    // Also verify it's deleted from the cookie store
    const cookieStore = await cookies();
    const tokenAfterDelete = cookieStore.get('auth_token');
    console.log('[API] Token exists after delete:', !!tokenAfterDelete);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // CRITICAL: Explicitly delete the cookie via response headers
    // This sends the Set-Cookie header to the browser to delete the cookie
    const deleteCookieHeader = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    console.log('[API] Setting Set-Cookie header:', deleteCookieHeader.substring(0, 50) + '...');
    response.headers.set('Set-Cookie', deleteCookieHeader);
    
    // Force no caching
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    console.log('[API] Logout successful, returning 200');
    console.log('[API] Response headers:', {
      'set-cookie': response.headers.get('set-cookie')?.substring(0, 50),
      'cache-control': response.headers.get('cache-control'),
    });
    
    return response;
  } catch (error) {
    console.error('[API] Logout error:', error);
    
    // Still return success with delete cookie header even on error
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out',
      },
      { status: 200 }
    );

    // Delete cookie header
    const deleteCookieHeader = `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 UTC${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    response.headers.set('Set-Cookie', deleteCookieHeader);
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    console.log('[API] Returning error response with delete cookie header');
    return response;
  }
}

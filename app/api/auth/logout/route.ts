/**
 * Logout API route
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    // Create response with Set-Cookie header to explicitly clear the cookie in the browser
    const response = NextResponse.json(
      {
        success: true,
        data: null,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );

    // Set cookie with Max-Age=0 and Expires in the past to clear it in the browser
    response.headers.set(
      'Set-Cookie',
      `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    );

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

    response.headers.set(
      'Set-Cookie',
      `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    );

    return response;
  }
}

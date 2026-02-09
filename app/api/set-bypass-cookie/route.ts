/**
 * API route to set bypass cookie for accessing full site
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Set the admin access cookie (same as in proxy.ts)
    cookieStore.set('afrobizz_admin', process.env.ADMIN_ACCESS_KEY || 'afrobizz_super_admin', {
      httpOnly: false, // Allow JavaScript access for easier mobile testing
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting bypass cookie:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set cookie' },
      { status: 500 }
    );
  }
}

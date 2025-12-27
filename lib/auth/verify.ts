import { cookies } from 'next/headers';

/**
 * Get the current user from the JWT in cookies (server-side only)
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    return payload;
  } catch {
    return null;
  }
}
/**
 * Authentication verification for all users (not just admin)
 */

import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * Verify user authentication (for any role)
 */
export async function verifyAuth(request: NextRequest) {
  try {
    // Try to get token from cookies first (client-side)
    const cookieToken = request.cookies.get('auth_token')?.value;
    
    // Then try authorization header (for API calls)
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    return {
      payload,
      token,
    };
  } catch {
    return null;
  }
}

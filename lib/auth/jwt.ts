/**
 * JWT Authentication utilities
 */

import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get token from request headers or cookies
 */
export async function getTokenFromRequest(request: Request | any): Promise<string | null> {
  // For NextRequest objects, try to use the built-in cookies method
  if (request.cookies) {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      return token;
    }
  }
  
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Try Next.js cookies() API
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');
  
  if (authToken) {
    return authToken.value;
  }
  
  // Also try to get from request.headers Cookie as fallback
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookieArray = cookieHeader.split(';').map((c: string) => c.trim());
    const authTokenCookie = cookieArray.find((c: string) => c.startsWith('auth_token='));
    if (authTokenCookie) {
      return authTokenCookie.substring('auth_token='.length);
    }
  }
  
  return null;
}

/**
 * Set auth token in cookies (for use in Response)
 */
export function setAuthCookieHeader(token: string) {
  return `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

/**
 * Set auth token in cookies (for client-side use)
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

/**
 * Clear auth cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  console.log('[clearAuthCookie] Before delete - cookie exists:', !!cookieStore.get('auth_token'));
  cookieStore.delete('auth_token');
  console.log('[clearAuthCookie] After delete - cookie exists:', !!cookieStore.get('auth_token'));
}

/**
 * Verify admin role
 */
export function isAdmin(payload: JWTPayload): boolean {
  return payload.role === 'admin';
}

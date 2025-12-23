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
  console.log('[getTokenFromRequest] Starting token extraction...');
  
  // For NextRequest objects, try to use the built-in cookies method
  if (request.cookies) {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      console.log('[getTokenFromRequest] Found token in request.cookies (NextRequest):', token.substring(0, 20) + '...');
      return token;
    }
    console.log('[getTokenFromRequest] request.cookies exists but auth_token not found');
  }
  
  const authHeader = request.headers.get('authorization');
  console.log('[getTokenFromRequest] Authorization header:', authHeader ? 'PRESENT' : 'NOT PRESENT');
  if (authHeader?.startsWith('Bearer ')) {
    console.log('[getTokenFromRequest] Found token in Authorization header');
    return authHeader.slice(7);
  }

  // Try Next.js cookies() API
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');
  
  console.log('[getTokenFromRequest] Cookie store auth_token:', authToken ? 'PRESENT' : 'NOT PRESENT');
  if (authToken) {
    console.log('[getTokenFromRequest] Token from cookie:', authToken.value.substring(0, 20) + '...');
    return authToken.value;
  }
  
  // Also try to get from request.headers Cookie
  const cookieHeader = request.headers.get('cookie');
  console.log('[getTokenFromRequest] Cookie header raw:', cookieHeader ? 'PRESENT' : 'NOT PRESENT');
  if (cookieHeader) {
    console.log('[getTokenFromRequest] Raw cookie header:', cookieHeader);
    // Parse manually
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const authTokenCookie = cookies.find(c => c.startsWith('auth_token='));
    if (authTokenCookie) {
      const token = authTokenCookie.substring('auth_token='.length);
      console.log('[getTokenFromRequest] Found token in raw Cookie header:', token.substring(0, 20) + '...');
      return token;
    }
  }
  
  console.log('[getTokenFromRequest] No token found in any location');
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

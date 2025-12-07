/**
 * Admin-only middleware for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, isAdmin, getTokenFromRequest } from '@/lib/auth/jwt';

/**
 * Verify admin authentication on API routes
 */
export async function verifyAdminAuth(request: NextRequest) {
  const token = await getTokenFromRequest(request);

  if (!token) {
    return {
      isValid: false,
      error: new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);

  if (!payload || !isAdmin(payload)) {
    return {
      isValid: false,
      error: new NextResponse(
        JSON.stringify({ success: false, error: 'Forbidden' }),
        { status: 403 }
      ),
    };
  }

  return {
    isValid: true,
    payload,
  };
}

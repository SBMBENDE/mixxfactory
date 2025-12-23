/**
 * Get current user endpoint
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';
import { successResponse, unauthorizedResponse } from '@/utils/api-response';
import { isTokenBlacklisted } from '@/lib/auth/logout-blacklist';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify the request is a valid NextRequest
    if (!request) {
      return unauthorizedResponse();
    }
    await connectDBWithTimeout();

    // Get token from request
    const token = await getTokenFromRequest(request);
    if (!token) {
      return unauthorizedResponse();
    }
    
    // Check if token is blacklisted (user logged out)
    if (isTokenBlacklisted(token)) {
      console.log('[API] Token is blacklisted (user logged out)');
      return unauthorizedResponse();
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return unauthorizedResponse();
    }

    // Get user from database
    const user = await UserModel.findById(payload.userId).select('-password');
    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.accountType,
        emailVerified: user.emailVerified,
      },
      'User data retrieved'
    );
  } catch (error) {
    console.error('Get user error:', error);
    return unauthorizedResponse();
  }
}

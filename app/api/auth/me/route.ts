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
      console.log('[API /api/auth/me] No request provided');
      return unauthorizedResponse();
    }
    await connectDBWithTimeout();

    // Get token from request
    const token = await getTokenFromRequest(request);
    if (!token) {
      console.log('[API /api/auth/me] No token found in request');
      return unauthorizedResponse();
    }
    
    console.log('[API /api/auth/me] Token found:', token.substring(0, 20) + '...');
    console.log('[API /api/auth/me] Token length:', token.length);
    console.log('[API /api/auth/me] Checking blacklist...');
    
    // Check if token is blacklisted (user logged out)
    const isBlacklisted = await isTokenBlacklisted(token);
    console.log('[API /api/auth/me] Blacklist check result:', isBlacklisted);
    
    if (isBlacklisted) {
      console.log('[API /api/auth/me] Token IS blacklisted (user logged out)');
      return unauthorizedResponse();
    }

    console.log('[API /api/auth/me] Token NOT blacklisted, proceeding with verification...');
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      console.log('[API /api/auth/me] Token verification failed');
      return unauthorizedResponse();
    }

    console.log('[API /api/auth/me] Token verified, fetching user:', payload.userId);
    
    // Get user from database
    const user = await UserModel.findById(payload.userId).select('-password');
    if (!user) {
      console.log('[API /api/auth/me] User not found:', payload.userId);
      return unauthorizedResponse();
    }

    console.log('[API /api/auth/me] User found, returning:', user.email);
    
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

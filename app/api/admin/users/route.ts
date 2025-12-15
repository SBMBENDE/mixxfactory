/**
 * Admin Users Management API
 * GET /api/admin/users - List all users
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';
import { errorResponse, successResponse, unauthorizedResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getTokenFromRequest(request);
    if (!token) {
      return unauthorizedResponse();
    }

    const payload = verifyToken(token);
    if (!payload) {
      return unauthorizedResponse();
    }

    await connectDBWithTimeout();

    // Verify user is admin
    const user = await UserModel.findById(payload.userId);
    if (!user || user.accountType !== 'admin') {
      return unauthorizedResponse();
    }

    // Get all users with pagination
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Get total count
    const total = await UserModel.countDocuments();

    // Get users (exclude password field)
    const users = await UserModel.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse('Failed to retrieve users', 500);
  }
}

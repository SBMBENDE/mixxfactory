/**
 * Admin Delete User API
 * DELETE /api/admin/users/[id]
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserModel } from '@/lib/db/models';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/jwt';
import { errorResponse, successResponse, unauthorizedResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const adminUser = await UserModel.findById(payload.userId);
    if (!adminUser || adminUser.accountType !== 'admin') {
      return unauthorizedResponse();
    }

    const userId = params.id;

    // Prevent admin from deleting themselves
    if (userId === payload.userId) {
      return errorResponse('Cannot delete your own admin account', 400);
    }

    // Delete user
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return errorResponse('User not found', 404);
    }

    console.log(`[Admin] User ${deletedUser.email} (${userId}) deleted by admin ${adminUser.email}`);

    return successResponse(
      {
        userId: deletedUser._id.toString(),
        email: deletedUser.email,
      },
      'User deleted successfully'
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse('Failed to delete user', 500);
  }
}

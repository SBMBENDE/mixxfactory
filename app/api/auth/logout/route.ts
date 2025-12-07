/**
 * Logout API route
 */

import { clearAuthCookie } from '@/lib/auth/jwt';
import { successResponse } from '@/utils/api-response';

export async function POST() {
  try {
    await clearAuthCookie();

    return successResponse(null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return successResponse(null, 'Logged out');
  }
}

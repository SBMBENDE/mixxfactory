/**
 * Logout API route
 */

import { successResponse } from '@/utils/api-response';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    return successResponse(null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return successResponse(null, 'Logged out');
  }
}

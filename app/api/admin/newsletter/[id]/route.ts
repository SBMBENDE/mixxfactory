/**
 * Admin Newsletter Delete Individual Subscriber
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { NewsletterSubscriberModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';
import { verifyAdminAuth } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return authResult.error;
    }

    await connectDBWithTimeout();

    const { id } = params;

    if (!id) {
      return errorResponse('Subscriber ID is required', 400);
    }

    const result = await NewsletterSubscriberModel.findByIdAndDelete(id);

    if (!result) {
      return errorResponse('Subscriber not found', 404);
    }

    console.log(`✅ [Newsletter Admin] Subscriber deleted: ${id}`);

    return successResponse(
      { deletedId: id },
      'Subscriber removed successfully'
    );
  } catch (error) {
    console.error('Newsletter admin delete error:', error);
    return errorResponse('Failed to remove subscriber', 500);
  }
}

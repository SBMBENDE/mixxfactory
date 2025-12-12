/**
 * Get single professional by ID
 */

import { connectDBWithTimeout } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
import { successResponse, notFoundResponse, internalErrorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  _: unknown,
  { params }: { params: { id: string } }
) {
  try {
    await connectDBWithTimeout();

    const { id } = params;

    const professional = await ProfessionalModel.findById(id).populate('category').lean();

    if (!professional) {
      return notFoundResponse('Professional');
    }

    return successResponse(professional);
  } catch (error) {
    console.error('Error fetching professional:', error);
    return internalErrorResponse();
  }
}

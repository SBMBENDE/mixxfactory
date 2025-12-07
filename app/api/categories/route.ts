/**
 * Categories API route (get all)
 */

import { connectDB } from '@/lib/db/connection';
import { CategoryModel } from '@/lib/db/models';
import { successResponse, internalErrorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const categories = await CategoryModel.find().sort({ name: 1 }).lean();

    return successResponse(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return internalErrorResponse();
  }
}

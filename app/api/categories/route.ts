/**
 * Categories API route (get all)
 */

import { connectDB } from '@/lib/db/connection';
import { CategoryModel } from '@/lib/db/models';
import { successResponse, internalErrorResponse } from '@/utils/api-response';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const categories = await CategoryModel.find().sort({ name: 1 }).lean();

    const response = successResponse(categories);
    // Ensure no caching on the response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return internalErrorResponse();
  }
}

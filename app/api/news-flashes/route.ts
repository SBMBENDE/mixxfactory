/**
 * Public News Flash API endpoint
 * GET - Fetch active news flashes
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { NewsFlashModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    await connectDBWithTimeout();

    const now = new Date();

    // Fetch active news flashes
    const newsFlashes = await NewsFlashModel.find({
      published: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(5)
      .lean();

    return successResponse(
      newsFlashes.map((n) => ({
        _id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        createdAt: n.createdAt,
      })),
      'News flashes fetched successfully',
      200
    );
  } catch (error) {
    console.error('News Flash GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch news flashes: ${errorMsg}`, 500);
  }
}

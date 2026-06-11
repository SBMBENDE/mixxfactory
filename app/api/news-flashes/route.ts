/**
 * Public News Flash API endpoint
 * GET - Fetch active news flashes
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { NewsFlashModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';

// Cache for 2 minutes - short enough for announcements, low enough request churn.
export const revalidate = 120;

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

    const response = successResponse(
      newsFlashes.map((n: any) => ({
        _id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        link: n.link || null,
        startDate: n.startDate,
        endDate: n.endDate,
        published: n.published,
        createdAt: n.createdAt,
      })),
      'News flashes fetched successfully',
      200
    );

    response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=120, stale-while-revalidate=900');
    return response;
  } catch (error) {
    console.error('News Flash GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch news flashes: ${errorMsg}`, 500);
  }
}

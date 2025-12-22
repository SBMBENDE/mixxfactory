/**
 * Server-side professionals utility for prefetching
 * This file is only used on the server and can safely use fetch with Next.js caching
 */

import { Professional } from '@/types';

interface ProfessionalsResponse {
  success: boolean;
  data: {
    data: Professional[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

/**
 * Fetch professionals with Next.js caching enabled
 * This will be cached for 30 minutes by default
 * Safe to call multiple times - only one request will hit the DB
 */
export async function getProfessionalsServer(
  options: {
    sort?: 'rating' | 'newest';
    limit?: number;
    page?: number;
  } = {}
): Promise<Professional[]> {
  try {
    const { sort = 'rating', limit = 8, page = 1 } = options;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const params = new URLSearchParams({
      sort,
      limit: limit.toString(),
      page: page.toString(),
    });

    const res = await fetch(`${baseUrl}/api/professionals?${params}`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!res.ok) {
      console.error('[getProfessionalsServer] API returned non-200 status:', res.status);
      return [];
    }

    const data: ProfessionalsResponse = await res.json();

    if (data.success && data.data?.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }

    console.error('[getProfessionalsServer] Invalid response format:', data);
    return [];
  } catch (error) {
    console.error('[getProfessionalsServer] Error fetching professionals:', error);
    return [];
  }
}

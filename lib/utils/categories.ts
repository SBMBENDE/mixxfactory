/**
 * Server-side categories utility for prefetching
 * This file is only used on the server and can safely use fetch with Next.js caching
 */

import { Category } from '@/types';

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  error?: string;
}

/**
 * Fetch categories with Next.js caching enabled
 * This will be cached for 1 hour by default
 * Safe to call multiple times - only one request will hit the DB
 */
export async function getCategoriesServer(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      console.error('[getCategoriesServer] API returned non-200 status:', res.status);
      return [];
    }

    const data: CategoriesResponse = await res.json();

    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }

    console.error('[getCategoriesServer] Invalid response format:', data);
    return [];
  } catch (error) {
    console.error('[getCategoriesServer] Error fetching categories:', error);
    return [];
  }
}

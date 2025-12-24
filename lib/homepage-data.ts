/**
 * Optimized homepage data fetching for ISR
 * - Uses .lean() for pure JS objects
 * - Selects only needed fields
 * - Deterministic sorting
 * - React cache prevents duplicate DB hits
 */

import { cache } from 'react';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';
import mongoose from 'mongoose';

/**
 * Get featured professionals - ISR optimized
 * - Lean queries (no Mongoose overhead)
 * - Deterministic sort (createdAt, not updatedAt)
 * - Indexed queries
 * - React cache prevents N+1 during render
 */
/**
 * Get featured professionals - ISR optimized
 * - Lean queries (no Mongoose overhead)
 * - Deterministic sort (createdAt, not updatedAt)
 * - Indexed queries
 * - React cache prevents N+1 during render
 */
export const getFeaturedProfessionals = cache(async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[PROFESSIONALS] Fetching featured professionals...');
    const queryStart = Date.now();

    // Get featured + active professionals
    let professionals = await ProfessionalModel.find({ featured: true, active: true })
      .select('name slug images gallery rating reviewCount category createdAt featured active')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean()
      .exec();

    // Fallback: if no featured found, get top active professionals
    if (!professionals || professionals.length === 0) {
      console.log('[PROFESSIONALS] No featured found, falling back to top-rated');
      professionals = await ProfessionalModel.find({ active: true })
        .select('name slug images gallery rating reviewCount category createdAt featured active')
        .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
        .limit(4)
        .lean()
        .exec();
    }

    const queryTime = Date.now() - queryStart;
    console.log(`[PROFESSIONALS] Fetched ${professionals?.length || 0} professionals in ${queryTime}ms`);

    // Transform: convert ObjectId to string
    return professionals.map((p: any) => ({
      ...p,
      _id: p._id?.toString(),
      category: p.category?.toString?.() || p.category,
    })) || [];
  } catch (error) {
    console.error('[PROFESSIONALS] Error:', error instanceof Error ? error.message : error);
    return [];
  }
});

/**
 * Get popular categories - ISR optimized
 * - Lean queries
 * - All categories (small dataset, safe)
 * - Sorted by name (alphabetical, deterministic)
 * - React cache prevents duplicate queries
 */
export const getPopularCategories = cache(async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const categories = await CategoryModel.find({})
      .select('name slug icon description')
      .sort({ name: 1 })
      .limit(7)
      .lean()
      .exec();

    console.log(`[CATEGORIES] Fetched ${categories?.length || 0} categories`);
    return categories || [];
  } catch (error) {
    console.error('[CATEGORIES] Error:', error instanceof Error ? error.message : error);
    return [];
  }
});

/**
 * Combined homepage data fetch
 * Wrapped in React cache to prevent duplicate queries during single render
 */
export const getHomepageData = cache(async () => {
  try {
    console.log('[HOMEPAGE] Starting data fetch...');
    const startTime = Date.now();

    const [professionals, categories] = await Promise.all([
      getFeaturedProfessionals(),
      getPopularCategories(),
    ]);

    const duration = Date.now() - startTime;
    console.log(`[HOMEPAGE] Data fetched in ${duration}ms`);

    // Transform for frontend
    return {
      professionals: professionals.map((p: any) => ({
        ...p,
        _id: p._id?.toString(),
        category: {
          _id: p.category?._id?.toString(),
          name: p.category?.name,
          slug: p.category?.slug,
        },
      })),
      categories: categories.map((c: any) => ({
        ...c,
        _id: c._id?.toString(),
      })),
      newsFlashes: [],
    };
  } catch (error) {
    console.error('[HOMEPAGE] Fatal error:', error);
    return {
      professionals: [],
      categories: [],
      newsFlashes: [],
    };
  }
});

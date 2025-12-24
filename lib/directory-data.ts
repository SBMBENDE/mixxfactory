/**
 * Directory page data fetching (Server-side)
 * Fetches professionals server-side for ISR + streaming
 */

import { cache } from 'react';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';
import mongoose from 'mongoose';

/**
 * Get all professionals for directory
 * - Server-side fetch for ISR
 * - No client timeout issues
 * - Lean query for performance
 */
export const getAllProfessionals = cache(async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const professionals = await ProfessionalModel.find({ active: true })
      .select('_id name slug images gallery rating reviewCount description location category featured createdAt')
      .sort({ featured: -1, createdAt: -1 })
      .limit(24)
      .lean()
      .exec();

    console.log(`[DIRECTORY] Fetched ${professionals?.length || 0} professionals`);

    // Transform
    return professionals.map((p: any) => ({
      ...p,
      _id: p._id?.toString(),
      category: p.category?.toString?.() || p.category,
      location: p.location || {},
    })) || [];
  } catch (error) {
    console.error('[DIRECTORY] Error fetching professionals:', error);
    return [];
  }
});

/**
 * Get all categories for filter dropdown
 */
export const getDirectoryCategories = cache(async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const categories = await CategoryModel.find({})
      .select('_id name slug icon')
      .sort({ name: 1 })
      .lean()
      .exec();

    console.log(`[DIRECTORY] Fetched ${categories?.length || 0} categories`);

    return categories.map((c: any) => ({
      ...c,
      _id: c._id?.toString(),
    })) || [];
  } catch (error) {
    console.error('[DIRECTORY] Error fetching categories:', error);
    return [];
  }
});

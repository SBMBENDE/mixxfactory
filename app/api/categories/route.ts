/**
 * Categories API route (get all)
 */

import { connectDB } from '@/lib/db/connection';
import { CategoryModel } from '@/lib/db/models';
import { successResponse, internalErrorResponse } from '@/utils/api-response';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // First, try direct MongoDB query
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    const directCategories = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
    console.log(`[Categories API] Direct MongoDB query found ${directCategories.length} categories`);

    // Also try through Mongoose model for comparison
    const mongooseCategories = await CategoryModel.find().sort({ name: 1 }).lean();
    console.log(`[Categories API] Mongoose query found ${mongooseCategories.length} categories`);

    // Use direct query result
    const categories = directCategories.map((doc: any) => ({
      _id: doc._id,
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      icon: doc.icon,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    console.log(`[Categories API] Returning ${categories.length} categories`);
    console.log('[Categories API] Category names:', categories.map((c: any) => c.name).join(', '));

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

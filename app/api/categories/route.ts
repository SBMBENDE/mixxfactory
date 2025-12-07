/**
 * Categories API route (get all)
 * Last Updated: 2025-12-07 11:30 - Direct MongoDB query
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

    // Get ALL documents, no sorting
    const allDocs = await db.collection('categories').find({}).toArray();
    console.log(`[Categories API] Direct query found ${allDocs.length} documents total`);
    allDocs.forEach((doc: any, i: number) => {
      console.log(`  ${i + 1}. ${doc.name} - _id: ${doc._id}`);
    });

    // Now sort
    const directCategories = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
    console.log(`[Categories API] After sort: ${directCategories.length} documents`);

    const categories = directCategories.map((doc: any) => ({
      _id: doc._id,
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      icon: doc.icon,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

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

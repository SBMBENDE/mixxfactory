/**
 * Categories API route (get all)
 * Last Updated: 2025-12-07 11:30 - Direct MongoDB query
 */

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Cache for 1 hour (3600 seconds) - categories don't change frequently
export const revalidate = 3600;

export async function GET() {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    return NextResponse.json(
      { success: false, error: 'MONGODB_URI not configured' },
      { status: 500 }
    );
  }

  let client: MongoClient | null = null;

  try {
    // Connect directly with MongoDB driver, bypassing Mongoose
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('mixxfactory');
    const collection = db.collection('categories');

    // Get all categories
    const categories = await collection
      .find({})
      .sort({ name: 1 })
      .toArray();

    console.log(`[Categories API] Found ${categories.length} categories in database`);

    // Format response
    const data = categories.map((doc: any) => ({
      _id: doc._id,
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      icon: doc.icon,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    const response = NextResponse.json({
      success: true,
      data,
    });

    // Disable all HTTP caching for admin fetches (if ?ts= param present)
    if (typeof globalThis !== 'undefined' && typeof Request !== 'undefined') {
      // This is a hack for Next.js API routes to check for query param
      // (Next.js API routes don't expose req.query directly in app router)
    }
    // If ?ts= param is present, set no-store
    const url = new URL(globalThis.location?.href || '', 'http://localhost');
    if (url.searchParams.has('ts')) {
      response.headers.set('Cache-Control', 'no-store, max-age=0');
    } else {
      response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    }

    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

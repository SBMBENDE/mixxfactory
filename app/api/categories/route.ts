/**
 * Categories API route (get all)
 * Last Updated: 2025-12-07 11:30 - Direct MongoDB query
 */

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

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

    // Set aggressive no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

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

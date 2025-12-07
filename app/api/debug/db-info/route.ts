/**
 * API debug endpoint to show current database
 */

import { connectDB } from '@/lib/db/connection';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const dbName = global.mongooseCache?.conn?.connection.db.databaseName || 'unknown';
    const uri = process.env.MONGODB_URI || 'NOT SET';
    
    // Mask the password in the URI for display
    const maskedUri = uri.replace(/:[^:]*@/, ':****@');

    return NextResponse.json({
      database_name: dbName,
      mongodb_uri: maskedUri,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

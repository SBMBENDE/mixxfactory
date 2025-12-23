/**
 * Debug endpoint to check what's in the LogoutToken collection
 */

import { NextResponse } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { LogoutTokenModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDBWithTimeout();
    
    const count = await LogoutTokenModel.countDocuments();
    const tokens = await LogoutTokenModel.find().lean();
    
    return NextResponse.json({
      status: 'ok',
      totalTokens: count,
      tokens: tokens.map(t => ({
        id: t._id,
        tokenPreview: t.token.substring(0, 30) + '...',
        tokenLength: t.token.length,
        expiresAt: t.expiresAt,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

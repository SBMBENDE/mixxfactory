/**
 * Debug endpoint to test blacklist save/check directly
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { LogoutTokenModel } from '@/lib/db/models';
import { blacklistToken, isTokenBlacklisted } from '@/lib/auth/logout-blacklist';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDBWithTimeout();
    
    // Count total tokens
    const count = await LogoutTokenModel.countDocuments();
    
    // Get all tokens
    const allTokens = await LogoutTokenModel.find().select('token createdAt').lean();
    
    return NextResponse.json({
      status: 'ok',
      totalTokens: count,
      tokens: allTokens.map(t => ({
        tokenPrefix: t.token.substring(0, 30) + '...',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testToken = body.token || `test-token-${Date.now()}`;
    
    console.error('[TEST-BLACKLIST] Testing token:', testToken.substring(0, 30));
    
    // Step 1: Check if already blacklisted
    console.error('[TEST-BLACKLIST] Step 1: Check if token is blacklisted...');
    const beforeBlacklist = await isTokenBlacklisted(testToken);
    console.error('[TEST-BLACKLIST] Before blacklist:', beforeBlacklist);
    
    // Step 2: Blacklist it
    console.error('[TEST-BLACKLIST] Step 2: Calling blacklistToken...');
    await blacklistToken(testToken);
    console.error('[TEST-BLACKLIST] blacklistToken completed');
    
    // Step 3: Check if now blacklisted
    console.error('[TEST-BLACKLIST] Step 3: Check if token is NOW blacklisted...');
    const afterBlacklist = await isTokenBlacklisted(testToken);
    console.error('[TEST-BLACKLIST] After blacklist:', afterBlacklist);
    
    // Step 4: Count total tokens
    await connectDBWithTimeout();
    const count = await LogoutTokenModel.countDocuments();
    console.error('[TEST-BLACKLIST] Total tokens in collection:', count);
    
    return NextResponse.json({
      status: 'ok',
      testToken: testToken.substring(0, 30) + '...',
      beforeBlacklist,
      afterBlacklist,
      totalTokensInDB: count,
      success: afterBlacklist === true
    });
  } catch (error) {
    console.error('[TEST-BLACKLIST] Error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

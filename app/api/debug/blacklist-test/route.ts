/**
 * Debug endpoint to test token blacklist functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/jwt';
import { isTokenBlacklisted, blacklistToken } from '@/lib/auth/logout-blacklist';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { LogoutTokenModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = await getTokenFromRequest(request);
  
  if (!token) {
    return NextResponse.json({
      status: 'error',
      message: 'No token found in request'
    }, { status: 400 });
  }
  
  const isBlacklisted = await isTokenBlacklisted(token);
  
  return NextResponse.json({
    status: 'ok',
    token: token.substring(0, 30) + '...',
    isBlacklisted: isBlacklisted,
    tokenLength: token.length,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const token = await getTokenFromRequest(request);
  
  if (!token) {
    return NextResponse.json({
      status: 'error',
      message: 'No token found in request'
    }, { status: 400 });
  }
  
  console.error('[BLACKLIST-TEST POST] Adding token to blacklist...');
  console.error('[BLACKLIST-TEST POST] Token:', token.substring(0, 30));
  console.error('[BLACKLIST-TEST POST] Token length:', token.length);
  
  try {
    await blacklistToken(token);
    console.error('[BLACKLIST-TEST POST] Token added successfully');
  } catch (err) {
    console.error('[BLACKLIST-TEST POST] Error adding token:', err);
    return NextResponse.json({
      status: 'error',
      message: 'Error adding token',
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
  
  console.error('[BLACKLIST-TEST POST] Now checking if token is blacklisted...');
  const isBlacklisted = await isTokenBlacklisted(token);
  
  console.error('[BLACKLIST-TEST POST] Check result:', isBlacklisted);
  
  // Also check database directly
  await connectDBWithTimeout();
  const count = await LogoutTokenModel.countDocuments();
  console.error('[BLACKLIST-TEST POST] Total tokens in DB:', count);
  
  return NextResponse.json({
    status: 'ok',
    message: 'Token blacklist test complete',
    token: token.substring(0, 30) + '...',
    isBlacklistedAfterAdd: isBlacklisted,
    totalTokensInDB: count,
    timestamp: new Date().toISOString()
  });
}

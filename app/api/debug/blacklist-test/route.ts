/**
 * Debug endpoint to test token blacklist functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth/jwt';
import { isTokenBlacklisted, blacklistToken } from '@/lib/auth/logout-blacklist';

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
  
  await blacklistToken(token);
  
  console.error('[BLACKLIST-TEST POST] Token added, now checking...');
  const isBlacklisted = await isTokenBlacklisted(token);
  
  console.error('[BLACKLIST-TEST POST] Check result:', isBlacklisted);
  
  return NextResponse.json({
    status: 'ok',
    message: 'Token blacklisted',
    token: token.substring(0, 30) + '...',
    isBlacklistedAfterAdd: isBlacklisted,
    timestamp: new Date().toISOString()
  });
}

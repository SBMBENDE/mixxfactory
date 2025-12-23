/**
 * Logout token blacklist
 * Stores tokens that have been logged out in MongoDB
 * This ensures users can't reuse old tokens even if cookies persist
 */

import { LogoutTokenModel } from '@/lib/db/models';
import { connectDBWithTimeout } from '@/lib/db/connection';

/**
 * Add a token to the blacklist (called on logout)
 */
export async function blacklistToken(token: string): Promise<void> {
  try {
    console.log('[blacklistToken] Starting blacklist process...');
    console.log('[blacklistToken] Token to blacklist:', token.substring(0, 20) + '...');
    
    await connectDBWithTimeout();
    console.log('[blacklistToken] Connected to database');
    
    // Get token expiration from JWT (typically 7 days)
    // Add token to database with expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    console.log('[blacklistToken] Creating logout token record with expiresAt:', expiresAt);
    
    const result = await LogoutTokenModel.create({
      token,
      expiresAt,
    });
    
    console.log('[blacklistToken] Token successfully added to blacklist, record ID:', result._id);
  } catch (error) {
    console.error('[blacklistToken] Error adding token to blacklist:', error);
    if (error instanceof Error) {
      console.error('[blacklistToken] Error message:', error.message);
      console.error('[blacklistToken] Error stack:', error.stack);
    }
    // Don't throw - we still want logout to succeed even if blacklist fails
  }
}

/**
 * Check if a token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    await connectDBWithTimeout();
    
    console.log('[isTokenBlacklisted] Checking if token is blacklisted...');
    console.log('[isTokenBlacklisted] Token to check:', token.substring(0, 20) + '...');
    
    const result = await LogoutTokenModel.findOne({ token });
    const isBlacklisted = !!result;
    
    console.log('[isTokenBlacklisted] Query result:', result ? 'FOUND (blacklisted)' : 'NOT FOUND');
    console.log('[isTokenBlacklisted] Token is blacklisted:', isBlacklisted);
    
    return isBlacklisted;
  } catch (error) {
    console.error('[isTokenBlacklisted] Error checking blacklist:', error);
    // On error, allow the request (fail open)
    return false;
  }
}

/**
 * Clean up expired tokens from blacklist (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await connectDBWithTimeout();
    
    const result = await LogoutTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    
    console.log('[cleanupExpiredTokens] Deleted', result.deletedCount, 'expired tokens');
  } catch (error) {
    console.error('[cleanupExpiredTokens] Error cleaning up tokens:', error);
  }
}


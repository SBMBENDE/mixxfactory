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
    await connectDBWithTimeout();
    
    // Get token expiration from JWT (typically 7 days)
    // Add token to database with expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    await LogoutTokenModel.create({
      token,
      expiresAt,
    });
  } catch (error) {
    console.error('[blacklistToken] Error adding token to blacklist:', error);
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
    console.log('[isTokenBlacklisted] Token:', token.substring(0, 20) + '...');
    console.log('[isTokenBlacklisted] Token length:', token.length);
    
    const result = await LogoutTokenModel.findOne({ token });
    console.log('[isTokenBlacklisted] Query result:', result ? 'FOUND' : 'NOT FOUND');
    
    if (result) {
      console.log('[isTokenBlacklisted] Token is BLACKLISTED - user logged out');
      return true;
    }
    
    console.log('[isTokenBlacklisted] Token NOT in blacklist - user still authenticated');
    return false;
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


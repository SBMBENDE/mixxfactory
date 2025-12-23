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
    
    console.log('[blacklistToken] Saving token to blacklist');
    console.log('[blacklistToken] Token hash (first 30 chars):', token.substring(0, 30));
    console.log('[blacklistToken] Token length:', token.length);
    
    // Get token expiration from JWT (typically 7 days)
    // Add token to database with expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    const result = await LogoutTokenModel.create({
      token,
      expiresAt,
    });
    
    console.log('[blacklistToken] Token saved to database with ID:', result._id);
    console.log('[blacklistToken] Saved token from DB (first 30 chars):', result.token.substring(0, 30));
    console.log('[blacklistToken] Verification: tokens match?', result.token === token);
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
    
    console.log('[isTokenBlacklisted] Checking token...');
    console.log('[isTokenBlacklisted] Token to check (first 30 chars):', token.substring(0, 30));
    console.log('[isTokenBlacklisted] Token length:', token.length);
    
    // Try exact match
    const result = await LogoutTokenModel.findOne({ token });
    console.log('[isTokenBlacklisted] Exact match result:', result ? 'FOUND' : 'NOT FOUND');
    
    if (result) {
      console.log('[isTokenBlacklisted] Found in blacklist - returning true');
      return true;
    }
    
    // Check how many tokens are in the blacklist for debugging
    const count = await LogoutTokenModel.countDocuments();
    console.log('[isTokenBlacklisted] Total tokens in blacklist collection:', count);
    
    // Get first token from blacklist to compare
    const firstToken = await LogoutTokenModel.findOne().select('token').lean();
    if (firstToken) {
      console.log('[isTokenBlacklisted] First token in DB (first 30 chars):', firstToken.token.substring(0, 30));
      console.log('[isTokenBlacklisted] First token length:', firstToken.token.length);
      console.log('[isTokenBlacklisted] Do they match?', firstToken.token === token);
    }
    
    console.log('[isTokenBlacklisted] Token NOT found in blacklist - returning false');
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


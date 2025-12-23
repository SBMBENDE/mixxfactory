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
  console.error('[blacklistToken] ===== BLACKLIST SAVE STARTED =====');
  console.error('[blacklistToken] Token to save (first 30):', token.substring(0, 30));
  
  try {
    console.error('[blacklistToken] Connecting to database...');
    await connectDBWithTimeout();
    console.error('[blacklistToken] Database connected');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    console.error('[blacklistToken] Creating record with expiresAt:', expiresAt.toISOString());
    const result = await LogoutTokenModel.create({
      token,
      expiresAt,
    });
    
    console.error('[blacklistToken] Record created with ID:', result._id);
    console.error('[blacklistToken] Saved token (first 30):', result.token.substring(0, 30));
    console.error('[blacklistToken] Tokens match?', result.token === token);
    console.error('[blacklistToken] ===== BLACKLIST SAVE COMPLETE =====');
  } catch (error) {
    console.error('[blacklistToken] ===== EXCEPTION DURING SAVE =====');
    console.error('[blacklistToken] Error:', error);
    console.error('[blacklistToken] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    if (error instanceof Error) {
      console.error('[blacklistToken] Stack:', error.stack);
    }
  }
}

/**
 * Check if a token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  console.error('[isTokenBlacklisted] ===== BLACKLIST CHECK STARTED =====');
  console.error('[isTokenBlacklisted] Token input (first 30):', token.substring(0, 30));
  
  try {
    console.error('[isTokenBlacklisted] Attempting database connection...');
    await connectDBWithTimeout();
    console.error('[isTokenBlacklisted] Database connected');
    
    console.error('[isTokenBlacklisted] LogoutTokenModel type:', typeof LogoutTokenModel);
    console.error('[isTokenBlacklisted] LogoutTokenModel.findOne:', typeof LogoutTokenModel.findOne);
    
    const result = await LogoutTokenModel.findOne({ token });
    console.error('[isTokenBlacklisted] Query result:', result ? 'FOUND' : 'NOT FOUND');
    
    if (result) {
      console.error('[isTokenBlacklisted] TOKEN IS BLACKLISTED - RETURNING TRUE');
      return true;
    }
    
    // Check how many tokens are in the blacklist
    const count = await LogoutTokenModel.countDocuments();
    console.error('[isTokenBlacklisted] Total tokens in collection:', count);
    
    if (count > 0) {
      const firstToken = await LogoutTokenModel.findOne().select('token').lean();
      if (firstToken) {
        console.error('[isTokenBlacklisted] First token in DB (first 30):', firstToken.token.substring(0, 30));
        console.error('[isTokenBlacklisted] Tokens match?', firstToken.token === token);
      }
    }
    
    console.error('[isTokenBlacklisted] TOKEN NOT IN BLACKLIST - RETURNING FALSE');
    return false;
  } catch (error) {
    console.error('[isTokenBlacklisted] EXCEPTION:', error);
    console.error('[isTokenBlacklisted] Error type:', error instanceof Error ? error.constructor.name : typeof error);
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


/**
 * Logout token blacklist
 * Stores tokens that have been logged out
 * This ensures users can't reuse old tokens even if cookies persist
 */

// In-memory set of blacklisted tokens
// In production, this should be stored in Redis or a database
const logoutTokenBlacklist = new Set<string>();

/**
 * Add a token to the blacklist (called on logout)
 */
export function blacklistToken(token: string): void {
  logoutTokenBlacklist.add(token);
}

/**
 * Check if a token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return logoutTokenBlacklist.has(token);
}

/**
 * Clear the entire blacklist (for testing)
 */
export function clearBlacklist(): void {
  logoutTokenBlacklist.clear();
}

/**
 * Get the size of the blacklist
 */
export function getBlacklistSize(): number {
  return logoutTokenBlacklist.size;
}

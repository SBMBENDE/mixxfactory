/**
 * Password hashing utilities using bcryptjs
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(): {
  token: string;
  hash: string;
  expires: Date;
} {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  return { token, hash, expires };
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(): {
  token: string;
  hash: string;
  expires: Date;
} {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return { token, hash, expires };
}

/**
 * Hash a token (for storage in DB)
 */
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

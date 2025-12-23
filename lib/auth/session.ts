/**
 * Session management for device isolation
 * Each login creates a unique session that's tied to a device fingerprint
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { UserSessionModel } from '@/lib/db/models';
import { NextRequest } from 'next/server';

/**
 * Generate device fingerprint from User-Agent and Accept-Language
 */
export function generateDeviceFingerprint(userAgent?: string, acceptLanguage?: string): string {
  const fingerprint = `${userAgent || 'unknown'}|${acceptLanguage || 'unknown'}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  userAgent?: string,
  acceptLanguage?: string,
  ipAddress?: string
): Promise<string> {
  await connectDBWithTimeout();
  
  const sessionId = uuidv4();
  const deviceFingerprint = generateDeviceFingerprint(userAgent, acceptLanguage);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  console.log(`[createSession] Creating new session for user ${userId}`);
  console.log(`[createSession] Session ID: ${sessionId}`);
  console.log(`[createSession] Device fingerprint: ${deviceFingerprint}`);
  
  try {
    const session = await UserSessionModel.create({
      userId,
      sessionId,
      deviceFingerprint,
      userAgent,
      ipAddress,
      isActive: true,
      expiresAt,
    });

    console.log(`[createSession] Session created successfully`);
    return sessionId;
  } catch (error) {
    console.error(`[createSession] Error creating session:`, error);
    throw error;
  }
}

/**
 * Verify session is still active and matches device
 */
export async function verifySession(
  sessionId: string,
  userId: string,
  userAgent?: string,
  acceptLanguage?: string
): Promise<boolean> {
  await connectDBWithTimeout();

  const deviceFingerprint = generateDeviceFingerprint(userAgent, acceptLanguage);

  console.log(`[verifySession] Verifying session ${sessionId.substring(0, 8)}...`);
  console.log(`[verifySession] Expected device fingerprint: ${deviceFingerprint}`);

  try {
    const session = await UserSessionModel.findOne({
      sessionId,
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!session) {
      console.log(`[verifySession] Session not found or expired`);
      return false;
    }

    // Check device fingerprint matches
    if (session.deviceFingerprint !== deviceFingerprint) {
      console.log(`[verifySession] Device fingerprint mismatch - blocking access`);
      console.log(`[verifySession] Stored: ${session.deviceFingerprint}`);
      console.log(`[verifySession] Provided: ${deviceFingerprint}`);
      return false;
    }

    console.log(`[verifySession] ✓ Session verified and valid`);
    return true;
  } catch (error) {
    console.error(`[verifySession] Error verifying session:`, error);
    return false;
  }
}

/**
 * Invalidate a session (on logout)
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  await connectDBWithTimeout();

  console.log(`[invalidateSession] Invalidating session ${sessionId.substring(0, 8)}...`);

  try {
    const result = await UserSessionModel.updateOne(
      { sessionId },
      { isActive: false }
    );

    console.log(`[invalidateSession] Session invalidated`, result);
  } catch (error) {
    console.error(`[invalidateSession] Error invalidating session:`, error);
  }
}

/**
 * Get device info from request
 */
export function getDeviceInfoFromRequest(request: NextRequest): {
  userAgent?: string;
  acceptLanguage?: string;
  ipAddress?: string;
} {
  return {
    userAgent: request.headers.get('user-agent') || undefined,
    acceptLanguage: request.headers.get('accept-language') || undefined,
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
  };
}

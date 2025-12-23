/**
 * Authentication hook
 * 
 * This hook provides access to the global auth state managed by AuthProvider.
 * It uses React Context to ensure a single source of truth for authentication
 * across all components, preventing race conditions where logout might be
 * overridden by other components checking auth independently.
 * 
 * Must be used within components wrapped by AuthProvider (typically at app root).
 */

'use client';

export { useAuth } from '@/components/AuthProvider';
export type { UseAuthReturn } from '@/components/AuthProvider';


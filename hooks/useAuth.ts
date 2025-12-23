/**
 * Hook for managing authentication state
 * Implements 3-state auth system: loading -> authenticated/unauthenticated
 * Checks actual session validity via /api/auth/me endpoint
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface UseAuthReturn {
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  user: AuthUser | null;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    setAuthStatus('loading');
    console.log('[useAuth] Checking authentication status...');
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      console.log('[useAuth] Auth check response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          console.log('[useAuth] User authenticated:', data.data.email);
          setUser(data.data);
          setAuthStatus('authenticated');
          setHasCheckedAuth(true);
          return;
        }
      }
      
      console.log('[useAuth] User not authenticated');
      setAuthStatus('unauthenticated');
      setUser(null);
      setHasCheckedAuth(true);
    } catch (error) {
      console.error('[useAuth] Auth check error:', error);
      setAuthStatus('unauthenticated');
      setUser(null);
      setHasCheckedAuth(true);
    }
  }, []);

  // Logout - Clear state FIRST, then call API, then verify with fresh check
  const logout = useCallback(async () => {
    console.log('[useAuth] Logout initiated');
    
    // Immediately clear local state and mark as unauthenticated (not loading)
    // This prevents the visibility listener from re-triggering checkAuth
    setAuthStatus('unauthenticated');
    setUser(null);
    setHasCheckedAuth(true);
    
    // Clear any stored auth data
    if (typeof window !== 'undefined') {
      console.log('[useAuth] Clearing localStorage and sessionStorage');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
    
    console.log('[useAuth] Local auth state cleared');
    
    // Then call logout API
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      console.log('[useAuth] Logout API response:', response.status);
      
      if (!response.ok) {
        console.warn('[useAuth] Logout API error:', response.status);
      }
      
      // Wait longer for cookie to be deleted and ensure server processed request
      console.log('[useAuth] Waiting for cookie deletion...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Do a fresh auth check to verify token is really invalid
      console.log('[useAuth] Doing fresh auth check to verify logout...');
      const verifyResponse = await fetch('/api/auth/me', { credentials: 'include' });
      console.log('[useAuth] Fresh auth check response:', verifyResponse.status);
      
      if (verifyResponse.status === 401) {
        console.log('[useAuth] ✓ Token confirmed invalid - logout successful');
      } else if (verifyResponse.status === 200) {
        console.warn('[useAuth] ⚠ Auth check returned 200 - token might not be blacklisted, forcing logout state');
        // Force logout state even if token still valid
      }
    } catch (error) {
      console.error('[useAuth] Logout error:', error);
    }
  }, []);

  // Check auth on mount and when component focuses
  useEffect(() => {
    // Only run once on mount
    if (!hasCheckedAuth) {
      checkAuth();
    }

    // Also check auth when page becomes visible (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasCheckedAuth, checkAuth]);

  return {
    authStatus,
    isAuthenticated: authStatus === 'authenticated',
    user,
    logout,
    refreshAuth: checkAuth,
  };
}

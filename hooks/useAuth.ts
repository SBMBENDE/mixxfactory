/**
 * Hook for managing authentication state
 * Checks actual session validity via /api/auth/me endpoint
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setUser(data.data);
          setIsAuthenticated(true);
          return;
        }
      }
      
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh auth state
  const refreshAuth = useCallback(async () => {
    setLoading(true);
    await checkAuth();
  }, [checkAuth]);

  // Logout
  const logout = useCallback(async () => {
    try {
      console.log('[useAuth] Calling /api/auth/logout');
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      console.log('[useAuth] Logout API response status:', response.status);
      
      if (!response.ok) {
        console.warn('[useAuth] Logout API returned error status:', response.status);
      }
      
      console.log('[useAuth] Response parsed successfully');
    } catch (error) {
      console.error('[useAuth] Logout fetch error:', error);
      throw error;
    } finally {
      // Clear local state immediately
      console.log('[useAuth] Clearing local auth state');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Check auth on mount and when component focuses
  useEffect(() => {
    checkAuth();

    // Also check auth when page becomes visible (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkAuth]);

  return {
    isAuthenticated,
    user,
    loading,
    logout,
    refreshAuth,
  };
}

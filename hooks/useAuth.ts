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
  isAuthenticated: boolean; // Backward compatibility
  user: AuthUser | null;
  loading: boolean; // Backward compatibility
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    setAuthStatus('loading');
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setUser(data.data);
          setAuthStatus('authenticated');
          return;
        }
      }
      
      setAuthStatus('unauthenticated');
      setUser(null);
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus('unauthenticated');
      setUser(null);
    }
  }, []);

  // Refresh auth state
  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  // Logout - Clear state FIRST, then call API
  const logout = useCallback(async () => {
    // Immediately clear local state before API call
    setAuthStatus('loading');
    setUser(null);
    
    // Clear any stored auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
    
    setAuthStatus('unauthenticated');
    
    // Then call logout API
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn('Logout API error:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
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
    authStatus,
    isAuthenticated: authStatus === 'authenticated', // Backward compatibility
    user,
    loading: authStatus === 'loading', // Backward compatibility
    logout,
    refreshAuth,
  };
}

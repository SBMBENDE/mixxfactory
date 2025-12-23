'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface UseAuthReturn {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
  user: any;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasCheckedAuth: boolean;
}

const AuthContext = createContext<UseAuthReturn | null>(null);

/**
 * Internal hook that provides auth logic
 * This is the actual implementation that runs once per app
 */
function useProvideAuth(): UseAuthReturn {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<any>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const checkAuth = async () => {
    if (hasCheckedAuth) return;
    
    setAuthStatus('loading');
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data || null);
        setAuthStatus('authenticated');
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    } catch (error) {
      console.error('[AuthProvider] Error checking auth:', error);
      setUser(null);
      setAuthStatus('unauthenticated');
    } finally {
      setHasCheckedAuth(true);
    }
  };

  const logout = async () => {
    try {
      // Immediately set to unauthenticated to prevent any race conditions
      setAuthStatus('unauthenticated');
      setUser(null);

      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Wait for cookie deletion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Do a fresh verification
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('[AuthProvider] Logout successful - not authenticated');
        setAuthStatus('unauthenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
      setAuthStatus('unauthenticated');
      setUser(null);
    }
  };

  // Check auth on mount only
  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth, checkAuth]);

  return {
    authStatus,
    isAuthenticated: authStatus === 'authenticated',
    user,
    logout,
    checkAuth,
    hasCheckedAuth,
  };
}

/**
 * AuthProvider component - wraps the entire app
 * Provides single source of truth for auth state
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook - can be called from any component
 * Always returns the same state from the provider above
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

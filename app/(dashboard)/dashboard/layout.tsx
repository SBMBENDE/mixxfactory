/**
 * Admin Dashboard Layout
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authStatus } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated
    if (authStatus === 'unauthenticated') {
      console.log('[Dashboard] User not authenticated, redirecting to login');
      window.location.href = '/auth/login';
    }
  }, [authStatus]);
        console.error('[Dashboard] Auth check error:', error);
        setIsLoading(false);
        // Redirect to login on any error
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 300);
      }
    };

    // Only check auth once
    if (checkAttempts === 0) {
      console.log('[Dashboard] Initial auth check starting...');
      setCheckAttempts(1);
      checkAuth();
    }
  }, [authStatus]);

  // Show loading state while auth is resolving
  if (authStatus === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Show redirect state while unauthenticated

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar - Reduced width to 160px */}
      <aside style={{ width: '160px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', overflowY: 'auto', position: 'relative' }}>
        <div style={{ padding: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>Admin</h1>
        </div>

        <nav style={{ padding: '0.5rem' }}>
          <a href="/dashboard" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontWeight: 'bold', backgroundColor: '#f3f4f6', fontSize: '0.75rem' }}>
            📊 Dashboard
          </a>
          <a href="/dashboard/users" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            👥 Users
          </a>
          <a href="/dashboard/categories" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            🏷️ Categories
          </a>
          <a href="/dashboard/professionals" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            👥 Professionals
          </a>
          <a href="/dashboard/reviews" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            ⭐ Reviews
          </a>
          <a href="/dashboard/newsletter" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            📧 Newsletter
          </a>
          <a href="/dashboard/events-management" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            🎉 Events
          </a>
          <a href="/dashboard/analytics" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            📈 Analytics
          </a>
        </nav>

        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
          <button
            onClick={async () => {
              console.log('[Dashboard Logout] Initiating logout...');
              try {
                const response = await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
                console.log('[Dashboard Logout] Response status:', response.status);
              } catch (error) {
                console.error('[Dashboard Logout] Error:', error);
              }
              // Wait longer for browser to process Set-Cookie deletion
              console.log('[Dashboard Logout] Waiting for browser to process cookie deletion...');
              await new Promise(resolve => setTimeout(resolve, 500));
              console.log('[Dashboard Logout] Redirecting to login...');
              window.location.href = '/auth/login';
            }}
            style={{
              width: '100%',
              padding: '0.4rem',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: '500',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="sm:p-3 md:p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}

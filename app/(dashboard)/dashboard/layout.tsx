/**
 * Admin Dashboard Layout
 */

'use client';

import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    // Check authentication via API with timeout
    const checkAuth = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        console.log('Checking auth...');
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Include cookies
          signal: controller.signal,
        });

        clearTimeout(timeout);
        console.log('Auth check status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Auth success:', data);
          setIsAuthed(true);
          setIsLoading(false);
        } else {
          console.log('Auth failed, redirecting to login');
          setIsLoading(false);
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 300);
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('Auth check error:', error);
        setIsLoading(false);
        // Redirect to login on any error
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 300);
      }
    };

    // Only check auth once
    if (checkAttempts === 0) {
      setCheckAttempts(1);
      checkAuth();
    }
  }, [checkAttempts]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
          <a href="/dashboard/categories" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            🏷️ Categories
          </a>
          <a href="/dashboard/professionals" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            👥 Professionals
          </a>
          <a href="/dashboard/reviews" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            ⭐ Reviews
          </a>
          <a href="/dashboard/analytics" style={{ display: 'block', padding: '0.5rem 0.5rem', marginBottom: '0.25rem', borderRadius: '0.375rem', color: '#1f2937', textDecoration: 'none', fontSize: '0.75rem' }}>
            📈 Analytics
          </a>
        </nav>

        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' }}>
          <button
            onClick={() => {
              document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
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

// useGlobal401Handler.tsx
// React hook to globally handle 401 Unauthorized responses and redirect to login

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useGlobal401Handler() {
  const router = useRouter();

  useEffect(() => {
    const handleResponse = (event: any) => {
      if (event?.detail?.status === 401) {
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          // Only redirect to login for protected routes
          const isProtected =
            path.startsWith('/admin') ||
            path.startsWith('/professional') ||
            path.startsWith('/dashboard') ||
            path.startsWith('/profile') ||
            path.startsWith('/settings');
          // Never redirect on login/register/public/directory/professionals/events/blog/about/contact
          if (!isProtected) {
            return;
          }
        }
        // Clear local/session storage if needed
        localStorage.removeItem('auth');
        sessionStorage.removeItem('auth');
        // Redirect to login page
        router.push('/auth/login');
      }
    };
    window.addEventListener('mixx:unauthorized', handleResponse);
    return () => window.removeEventListener('mixx:unauthorized', handleResponse);
  }, [router]);
}

// Utility to dispatch a global 401 event
export function dispatchGlobal401() {
  window.dispatchEvent(new CustomEvent('mixx:unauthorized', { detail: { status: 401 } }));
}

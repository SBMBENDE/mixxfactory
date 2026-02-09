/**
 * Bypass page - Sets admin cookie to access full site in production
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BypassComingSoon() {
  const router = useRouter();
  const [status, setStatus] = useState<'setting' | 'success' | 'error'>('setting');

  useEffect(() => {
    const setBypassCookie = async () => {
      try {
        const response = await fetch('/api/set-bypass-cookie', {
          method: 'POST',
        });

        if (response.ok) {
          setStatus('success');
          // Redirect to home after 2 seconds
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Failed to set bypass cookie:', error);
        setStatus('error');
      }
    };

    setBypassCookie();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'setting' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Setting Access...
            </h1>
            <p className="text-gray-600">Please wait</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Access Granted!
            </h1>
            <p className="text-gray-600">
              You can now access the full app on afrobizz.com
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to homepage...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Error
            </h1>
            <p className="text-gray-600 mb-4">
              Failed to set access cookie
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

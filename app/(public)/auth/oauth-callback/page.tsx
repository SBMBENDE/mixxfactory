/**
 * OAuth Callback Bridge Page
 * Converts NextAuth session to custom JWT auth_token
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bridgeAuth = async () => {
      if (status === 'loading') {
        return; // Still loading session
      }

      if (status === 'unauthenticated' || !session) {
        // No session, redirect to login
        router.push('/auth/login?error=oauth_failed');
        return;
      }

      try {
        // Call API to convert NextAuth session to custom auth_token
        const response = await fetch('/api/auth/oauth-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user?.email,
            name: session.user?.name,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create auth session');
        }

        const data = await response.json();

        if (data.success) {
          // Redirect to professional dashboard
          router.push('/professional');
        } else {
          setError(data.error || 'Authentication failed');
        }
      } catch (err) {
        console.error('[OAuth Bridge] Error:', err);
        setError('Failed to complete authentication');
      }
    };

    bridgeAuth();
  }, [session, status, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Authentication Error
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            Completing sign in...
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    </div>
  );
}

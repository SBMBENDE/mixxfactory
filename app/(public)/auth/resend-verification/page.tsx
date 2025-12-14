/**
 * Resend Verification Email Page
 * /app/(public)/auth/resend-verification/page.tsx
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend verification email');
        return;
      }

      setSubmitted(true);

      // Show verification link in development
      if (data.verificationLink) {
        console.log('Verification link (dev):', data.verificationLink);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Resend Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {submitted
              ? 'Check your email for the verification link'
              : 'Enter your email to receive a new verification link'}
          </p>

          {submitted ? (
            // Success State
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                  ✓ Verification email sent! Check your inbox and spam folder.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Link expires in 24 hours.</strong> If you don&apos;t see it, try:
                </p>
                <ul className="text-blue-700 dark:text-blue-300 text-xs mt-2 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Wait a few minutes and refresh</li>
                  <li>• Request a new link again</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Send Another Link
                </button>

                <Link
                  href="/auth/login"
                  className="block text-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Verification Link'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remember your password?{' '}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Login here
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

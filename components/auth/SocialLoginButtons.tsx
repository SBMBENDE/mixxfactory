/**
 * Social Login Buttons Component
 * Google and Facebook OAuth authentication
 */

'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

interface SocialLoginButtonsProps {
  mode?: 'login' | 'register';
}

export default function SocialLoginButtons({ 
  mode = 'login' 
}: SocialLoginButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsGoogleLoading(true);
      // Redirect to oauth-callback after successful Google signin
      const result = await signIn('google', { 
        callbackUrl: '/auth/oauth-callback',
        redirect: true 
      });
      if (result?.error) {
        setError('Failed to sign in with Google. Please try again.');
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError(null);
      setIsFacebookLoading(true);
      // Redirect to oauth-callback after successful Facebook signin
      const result = await signIn('facebook', { 
        callbackUrl: '/auth/oauth-callback',
        redirect: true 
      });
      if (result?.error) {
        setError('Failed to sign in with Facebook. Please try again.');
        setIsFacebookLoading(false);
      }
    } catch (err) {
      console.error('Facebook sign-in error:', err);
      setError('Failed to sign in with Facebook. Please try again.');
      setIsFacebookLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isFacebookLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          <FaGoogle className="text-xl text-[#DB4437]" />
        )}
        <span>
          {mode === 'login' ? 'Sign in' : 'Sign up'} with Google
        </span>
      </button>

      {/* Facebook button */}
      <button
        type="button"
        onClick={handleFacebookSignIn}
        disabled={isGoogleLoading || isFacebookLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isFacebookLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          <FaFacebook className="text-xl text-[#1877F2]" />
        )}
        <span>
          {mode === 'login' ? 'Sign in' : 'Sign up'} with Facebook
        </span>
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  );
}

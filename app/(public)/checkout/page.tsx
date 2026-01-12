/**
 * Payment checkout page
 * /app/(public)/checkout/page.tsx
 * Allows users to select subscription tier and payment provider
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PRICING } from '@/types/payment';
import { useAuth } from '@/components/AuthProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const redirectUrl = searchParams.get('redirect') || '';
  const tierFromUrl = searchParams.get('tier');
  const { user, authStatus } = useAuth();
  const [selectedTier, setSelectedTier] = useState<string>(tierFromUrl || 'starter');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      // Redirect to login with return URL
      router.push('/login?redirect=/checkout');
    } else if (authStatus === 'authenticated') {
      setCheckingAuth(false);
    }
  }, [authStatus, router]);

  const handlePaymentClick = (provider: 'stripe' | 'paypal') => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    setLoading(true);
    // Navigate to payment processing page with selected tier, provider, and redirect
    const params = new URLSearchParams({ tier: selectedTier, provider });
    if (redirectUrl) params.set('redirect', redirectUrl);
    router.push(`/payment/process?${params.toString()}`);
  };

  // Show loading while checking auth
  if (checkingAuth || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Filter out free tier for checkout
  const paidTiers = SUBSCRIPTION_PRICING.filter(tier => tier.id !== 'free');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upgrade Your Account
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose a plan that works best for you
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {paidTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl border-2 p-8 cursor-pointer transition-all ${
                selectedTier === tier.id
                  ? 'border-blue-500 shadow-xl scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.id === 'starter' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    €{tier.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedTier === tier.id && (
                <div className="absolute inset-0 rounded-2xl bg-blue-500/10 pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        {/* Payment Provider Selection */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Choose Payment Method
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stripe Button */}
            <button
              onClick={() => handlePaymentClick('stripe')}
              disabled={loading}
              className="group relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-8 hover:border-blue-500 dark:hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Pay with Stripe
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Credit/Debit Card, Apple Pay, Google Pay
                </p>
              </div>
            </button>

            {/* PayPal Button */}
            <button
              onClick={() => handlePaymentClick('paypal')}
              disabled={loading}
              className="group relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-8 hover:border-blue-500 dark:hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🅿️</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Pay with PayPal
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PayPal Balance, Bank Account
                </p>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>✓ Secure payment processing</p>
            <p>✓ Cancel anytime</p>
            <p>✓ 30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Choose Subscription Plan Page
 * Shown after email verification, before profile completion
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PRICING } from '@/types/payment';

export default function ChoosePlanPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>('free');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.push('/login?redirect=/register/choose-plan');
        }
      } catch (err) {
        router.push('/login?redirect=/register/choose-plan');
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleContinue = () => {
    if (selectedTier === 'free') {
      // Free tier goes directly to profile setup
      router.push('/register/professional');
    } else {
      // Paid tiers go to checkout
      router.push(`/checkout?tier=${selectedTier}&redirect=/register/professional`);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select a plan to get started. You can upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {SUBSCRIPTION_PRICING.map((tier) => (
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
                  {tier.price > 0 && <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Selection Indicator */}
              {selectedTier === tier.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
          >
            {`Continue with ${SUBSCRIPTION_PRICING.find(t => t.id === selectedTier)?.name}`}
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {selectedTier === 'free' 
              ? 'You can upgrade to a paid plan anytime from your dashboard'
              : 'You will be redirected to complete payment before setting up your profile'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

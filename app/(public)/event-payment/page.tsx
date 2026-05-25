/**
 * Event Payment Checkout Page
 * Handles payment for basic and premium event listings
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const EVENT_PRICING = {
  basic: {
    id: 'basic',
    name: '🎫 Basic Event',
    price: 4.99,
    duration: 'per event',
    description: 'Standard event listing with essential features',
  },
  premium: {
    id: 'premium',
    name: '⭐ Premium Event',
    price: 19.99,
    duration: 'per event',
    description: 'Featured visibility with priority placement',
  },
};

export default function EventPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, authStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

  const tierParam = searchParams?.get('tier') || 'basic';
  const tier = tierParam as 'basic' | 'premium';
  const selectedTier = EVENT_PRICING[tier] || EVENT_PRICING.basic;

  useEffect(() => {
    console.log('[EventPayment] Auth status:', authStatus, 'isAuthenticated:', isAuthenticated);
    
    // Wait for auth to finish loading
    if (authStatus === 'loading') {
      console.log('[EventPayment] Waiting for auth check to complete...');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('[EventPayment] Not authenticated, redirecting to login...');
      router.push('/login?redirect=/promote-event');
      return;
    }

    console.log('[EventPayment] User authenticated, loading event data...');
    
    // Load pending event data from session storage
    const pendingData = sessionStorage.getItem('pendingEventData');
    if (!pendingData) {
      console.log('[EventPayment] No pending event data, redirecting to promote-event...');
      router.push('/promote-event');
      return;
    }

    try {
      const data = JSON.parse(pendingData);
      console.log('[EventPayment] Event data loaded:', data.title);
      setEventData(data);
    } catch (error) {
      console.error('[EventPayment] Error parsing event data:', error);
      router.push('/promote-event');
    }
  }, [isAuthenticated, authStatus, router]);

  const handlePaymentClick = async (provider: 'stripe' | 'paypal') => {
    if (!user || !eventData) {
      return;
    }

    setLoading(true);

    try {
      // Create payment intent/order for event promotion
      const response = await fetch('/api/payment/create-event-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tier: tier,
          provider: provider,
          eventData: eventData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment provider
        if (provider === 'stripe' && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else if (provider === 'paypal' && data.approvalUrl) {
          window.location.href = data.approvalUrl;
        }
      } else {
        alert(data.error || 'Failed to create payment. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authStatus === 'loading' || (isAuthenticated && !eventData)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Event Promotion
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Choose your payment method to promote your event
          </p>
        </div>

        {/* Event Info */}
        {eventData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Event Details
            </h2>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p><strong>Title:</strong> {eventData.title}</p>
              <p><strong>Date:</strong> {new Date(eventData.startDate).toLocaleDateString()}</p>
              <p><strong>Venue:</strong> {eventData.location.venue}</p>
            </div>
          </div>
        )}

        {/* Pricing Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-blue-500 shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedTier.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {selectedTier.description}
            </p>
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">
                €{selectedTier.price}
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {selectedTier.duration}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {tier === 'basic' ? (
              <>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Basic event listing</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Search visibility</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Up to 1 image</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Event details & description</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Featured for 30 days</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Priority in search results</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Up to 5 images</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Up to 2 videos</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Homepage carousel</span>
                </div>
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">Social media boost</span>
                </div>
              </>
            )}
          </div>

          {/* Payment Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handlePaymentClick('stripe')}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                  </svg>
                  Pay with Stripe
                </>
              )}
            </button>

            <button
              onClick={() => handlePaymentClick('paypal')}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                  </svg>
                  Pay with PayPal
                </>
              )}
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/promote-event')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Back to Event Form
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Payment success page
 * /app/payment/success/page.tsx
 * Displays success message after successful payment
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const redirectUrl = searchParams.get('redirect');

  useEffect(() => {
    const confirmPayment = async () => {
      // Check if we have Stripe redirect parameters
      const paymentIntent = searchParams.get('payment_intent');
      const redirectStatus = searchParams.get('redirect_status');
      
      if (paymentIntent && redirectStatus === 'succeeded') {
        // User was redirected back from Stripe (e.g., after 3D Secure)
        // We need to confirm this payment in our database
        try {
          // Get payment record by provider payment ID
          const response = await fetch(`/api/payment/by-intent?intentId=${paymentIntent}`);
          
          if (!response.ok) {
            throw new Error('Payment record not found');
          }
          
          const data = await response.json();
          const payment = data.data;
          
          // Confirm the payment
          const confirmRes = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: payment._id,
              provider: 'stripe',
              providerPaymentId: paymentIntent,
            }),
          });

          if (!confirmRes.ok) {
            const confirmData = await confirmRes.json();
            throw new Error(confirmData.error || 'Payment confirmation failed');
          }
          
          console.log('Payment confirmed successfully after redirect');
          
          // Auto-redirect to specified URL after confirmation if provided
          if (redirectUrl && !error) {
            setTimeout(() => router.push(redirectUrl), 2000);
          }
        } catch (err: any) {
          console.error('Error confirming payment:', err);
          setError(err.message);
        } finally {
          setConfirming(false);
        }
      } else {
        // No redirect parameters, just show success page
        setConfirming(false);
        
        // Auto-redirect if redirect URL provided (non-3DS flow)
        if (redirectUrl && !error) {
          setTimeout(() => router.push(redirectUrl), 2000);
        }
      }
      
      // Trigger confetti animation only after confirming is done
      if (!error) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 100);
      }
    };

    confirmPayment();
  }, [searchParams, error, router, redirectUrl]);

  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Confirmation Issue
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Your payment was processed, but there was an issue confirming it. Please contact support.
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mb-8">{error}</p>
          <button
            onClick={() => router.push('/professional')}
            className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
        </div>
        
        {redirectUrl && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              ✨ Redirecting you to complete your profile...
            </p>
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your account has been upgraded. You now have access to all premium features.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            What&apos;s Next?
          </h2>
          <ul className="text-left space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Access your enhanced dashboard</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Explore all premium features</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Check your email for receipt</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => router.push('/professional')}
            className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push('/directory')}
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

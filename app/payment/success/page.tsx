/**
 * Payment success page
 * /app/payment/success/page.tsx
 * Displays success message after successful payment
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
        </div>
        
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

/**
 * Event Payment Success Page
 * Handles event creation after successful payment
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function EventPaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your payment...');
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setMessage('Invalid payment session');
      return;
    }

    // Check if this session was already processed (sessionStorage guard)
    const processedKey = `event_processed_${sessionId}`;
    const alreadyProcessed = sessionStorage.getItem(processedKey);
    
    if (alreadyProcessed) {
      console.log('[EventPaymentSuccess] Session already processed, skipping...');
      setStatus('success');
      setMessage('Payment successful! Your event has been created and is being reviewed.');
      setTimeout(() => router.push('/events'), 3000);
      return;
    }

    // Prevent duplicate API calls using ref (React StrictMode protection)
    if (hasVerifiedRef.current) {
      console.log('[EventPaymentSuccess] Already verified in this render, skipping...');
      return;
    }

    const verifyAndCreateEvent = async () => {
      console.log('[EventPaymentSuccess] Starting verification...');
      hasVerifiedRef.current = true;
      
      // Mark as processed immediately
      sessionStorage.setItem(processedKey, 'true');

      // Get event data from session storage
      const eventDataStr = sessionStorage.getItem('pendingEventData');
      if (!eventDataStr) {
        setStatus('error');
        setMessage('Event data not found. Please try again.');
        return;
      }

      try {
        const eventData = JSON.parse(eventDataStr);

        // Verify payment and create event
        const response = await fetch('/api/payment/verify-event-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            sessionId,
            eventData,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Clear session storage
          sessionStorage.removeItem('pendingEventData');
          
          setStatus('success');
          setMessage('Payment successful! Your event has been created and is being reviewed.');
          
          // Redirect to events page after 3 seconds
          setTimeout(() => {
            router.push('/events');
          }, 3000);
        } else {
          // If failed, remove the processed flag so user can retry
          sessionStorage.removeItem(processedKey);
          setStatus('error');
          setMessage(data.error || 'Failed to create event. Please contact support.');
        }
      } catch (error) {
        console.error('Error:', error);
        // If failed, remove the processed flag so user can retry
        sessionStorage.removeItem(processedKey);
        setStatus('error');
        setMessage('An error occurred. Please contact support.');
      }
    };

    verifyAndCreateEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to events page...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => router.push('/promote-event')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Event Form
            </button>
          </>
        )}
      </div>
    </div>
  );
}

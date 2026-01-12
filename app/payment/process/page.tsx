/**
 * Payment processing page
 * /app/payment/process/page.tsx
 * Handles actual payment processing with Stripe or PayPal
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function PaymentProcessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier');
  const provider = searchParams.get('provider') as 'stripe' | 'paypal';
  const redirectUrl = searchParams.get('redirect');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [providerPaymentId, setProviderPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tier || !provider) {
      router.push('/checkout');
      return;
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Important: Send cookies
          body: JSON.stringify({ subscriptionTier: tier, provider }),
        });

        const data = await response.json();

        if (!response.ok) {
          // If unauthorized, redirect to login
          if (response.status === 401) {
            router.push('/login?redirect=/checkout');
            return;
          }
          throw new Error(data.error || 'Failed to create payment');
        }

        console.log('API Response:', data);

        // Store payment IDs for confirmation
        setPaymentId(data.data?.paymentId || null);
        setProviderPaymentId(data.data?.providerPaymentId || null);

        if (provider === 'stripe') {
          console.log('Stripe client secret received:', data.data?.clientSecret);
          setClientSecret(data.data?.clientSecret || null);
        } else if (provider === 'paypal') {
          setOrderId(data.data?.orderId || null);
        }

        console.log('Payment setup complete. Provider:', provider, 'ClientSecret exists:', !!data.data?.clientSecret);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [tier, provider, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Setting up payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Upgrading to {tier} plan
          </p>

          {provider === 'stripe' && clientSecret && paymentId && providerPaymentId && (
            <>
              <div className="mb-4 text-sm text-gray-500">
                Debug: Stripe Key = {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Present' : 'MISSING'}
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret } as StripeElementsOptions}>
                <StripeCheckoutForm 
                  clientSecret={clientSecret} 
                  paymentId={paymentId}
                  providerPaymentId={providerPaymentId}
                  redirectUrl={redirectUrl}
                />
              </Elements>
            </>
          )}

          {provider === 'stripe' && !clientSecret && (
            <div className="text-red-600">
              No client secret available. Check console logs.
            </div>
          )}

          {provider === 'paypal' && orderId && paymentId && (
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                currency: 'EUR',
              }}
            >
              {(() => {
                // Store redirectUrl in global scope for PayPal callback
                if (redirectUrl) (window as any).paymentRedirectUrl = redirectUrl;
                return <PayPalCheckout orderId={orderId} paymentId={paymentId} />;
              })()}
            </PayPalScriptProvider>
          )}
        </div>
      </div>
    </div>
  );
}

function StripeCheckoutForm({ 
  clientSecret: _clientSecret, 
  paymentId,
  providerPaymentId,
  redirectUrl
}: { 
  clientSecret: string;
  paymentId: string;
  providerPaymentId: string;
  redirectUrl: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const returnUrl = redirectUrl 
        ? `${window.location.origin}/payment/success?redirect=${encodeURIComponent(redirectUrl)}`
        : `${window.location.origin}/payment/success`;
      
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment in database
        try {
          const confirmRes = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              provider: 'stripe',
              providerPaymentId,
            }),
          });

          if (!confirmRes.ok) {
            const confirmResult = await confirmRes.json();
            throw new Error(confirmResult.error || 'Payment confirmation failed');
          }

          const successUrl = redirectUrl 
            ? `/payment/success?redirect=${encodeURIComponent(redirectUrl)}` 
            : '/payment/success';
          router.push(successUrl);
        } catch (confirmErr: any) {
          setError(confirmErr.message);
          setProcessing(false);
        }
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </button>
    </form>
  );
}

function PayPalCheckout({ orderId, paymentId }: { orderId: string; paymentId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (data: any) => {
    try {
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentId,
          provider: 'paypal',
          providerPaymentId: data.orderID,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment confirmation failed');
      }

      const successUrl = (window as any).paymentRedirectUrl 
        ? `/payment/success?redirect=${encodeURIComponent((window as any).paymentRedirectUrl)}` 
        : '/payment/success';
      router.push(successUrl);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PayPalButtons
        createOrder={() => Promise.resolve(orderId)}
        onApprove={handleApprove}
        onError={(err: any) => setError(err.message || 'PayPal error occurred')}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
        }}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function PaymentProcessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    }>
      <PaymentProcessContent />
    </Suspense>
  );
}

/**
 * Stripe Connect Account Status Component
 * Shows promoter's connected account status and onboarding link
 */

'use client';

import { useState, useEffect } from 'react';

interface ConnectStatusProps {
  eventId: string;
}

interface AccountStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  accountId?: string;
  requirements?: {
    currentlyDue?: string[];
    pastDue?: string[];
  };
  message?: string;
}

export default function StripeConnectStatus({ eventId }: ConnectStatusProps) {
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, [eventId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stripe/connect/status?eventId=${eventId}`);
      
      // Check if response is OK
      if (!res.ok) {
        setError(`Failed to fetch status (${res.status})`);
        setLoading(false);
        return;
      }

      // Check content type
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Expected JSON but got:', contentType);
        setError('Invalid response from server');
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch (err) {
      console.error('Status fetch error:', err);
      setError('Failed to fetch connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async () => {
    try {
      setOnboardingLoading(true);
      setError('');

      const res = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
        }),
      });

      // Check if response is OK
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Onboarding API error:', errorText);
        setError(`Failed to create onboarding link (${res.status})`);
        setOnboardingLoading(false);
        return;
      }

      // Check content type
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Expected JSON but got:', contentType);
        setError('Invalid response from server');
        setOnboardingLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success && data.data.url) {
        // Redirect to Stripe onboarding
        window.location.href = data.data.url;
      } else {
        setError(data.error || 'Failed to create onboarding link');
        setOnboardingLoading(false);
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to start onboarding process');
      setOnboardingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
        <p style={{ color: '#6b7280' }}>Loading connection status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: '#fee2e2',
          borderRadius: '0.5rem',
          border: '1px solid #fca5a5',
        }}
      >
        <p style={{ color: '#991b1b' }}>{error}</p>
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.5rem',
          border: '1px solid #bfdbfe',
        }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>
          💳 Enable Ticket Sales
        </h3>
        <p style={{ color: '#1e40af', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Connect your Stripe account to receive payments directly from ticket sales.
          You&apos;ll receive 95% of ticket revenue (or 97% for premium events).
        </p>
        <button
          onClick={handleConnectAccount}
          disabled={onboardingLoading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: onboardingLoading ? '#9ca3af' : '#2563eb',
            color: 'white',
            borderRadius: '0.375rem',
            fontWeight: '600',
            border: 'none',
            cursor: onboardingLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {onboardingLoading ? 'Loading...' : 'Connect Stripe Account'}
        </button>
      </div>
    );
  }

  if (!status.chargesEnabled || !status.payoutsEnabled) {
    return (
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: '#fef3c7',
          borderRadius: '0.5rem',
          border: '1px solid #fde047',
        }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#92400e' }}>
          ⚠️ Account Setup Incomplete
        </h3>
        <p style={{ color: '#92400e', marginBottom: '1rem', fontSize: '0.875rem' }}>
          Your Stripe account is connected but verification is incomplete.
          Complete the verification to start receiving payments.
        </p>
        {status.requirements && status.requirements.currentlyDue && status.requirements.currentlyDue.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>
              Required Information:
            </p>
            <ul style={{ fontSize: '0.875rem', color: '#92400e', marginLeft: '1.25rem' }}>
              {status.requirements.currentlyDue.map((req, idx) => (
                <li key={idx}>{req.replace(/_/g, ' ')}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={handleConnectAccount}
          disabled={onboardingLoading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: onboardingLoading ? '#9ca3af' : '#ea580c',
            color: 'white',
            borderRadius: '0.375rem',
            fontWeight: '600',
            border: 'none',
            cursor: onboardingLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {onboardingLoading ? 'Loading...' : 'Complete Verification'}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: '#d1fae5',
        borderRadius: '0.5rem',
        border: '1px solid #6ee7b7',
      }}
    >
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: '#065f46' }}>
        ✅ Ticketing Enabled
      </h3>
      <p style={{ color: '#065f46', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        Your Stripe account is fully connected and verified. You can now sell tickets and receive
        payments directly.
      </p>
      <p style={{ fontSize: '0.75rem', color: '#059669' }}>
        Account ID: {status.accountId}
      </p>
    </div>
  );
}

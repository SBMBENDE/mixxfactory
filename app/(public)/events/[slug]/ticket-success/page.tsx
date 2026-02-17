/**
 * Ticket Purchase Success Page
 * Displayed after successful Stripe Checkout
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';

export default function TicketSuccessPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const sessionId = searchParams?.get('session_id');
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Optional: Verify the session on the backend
    const verifySession = async () => {
      try {
        // You can create an API route to verify the session if needed
        setLoading(false);
      } catch (err) {
        console.error('Verification error:', err);
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <section style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '80vh' }}>
        <p style={{ color: '#6b7280' }}>Verifying your purchase...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '80vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
            Something Went Wrong
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
          <Link
            href="/events"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)',
              color: 'white',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Back to Events
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '80vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Success Animation */}
        <div
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            animation: 'successPulse 1s ease-in-out',
          }}
        >
          ✓
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
          Purchase Successful!
        </h1>

        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
          Your tickets have been confirmed. Check your email for confirmation and ticket details.
        </p>

        <div
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0369a1' }}>
            📧 What&apos;s Next?
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, color: '#075985' }}>
            <li style={{ marginBottom: '0.5rem' }}>✓ Check your email for ticket confirmation</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Save your tickets (PDF or mobile)</li>
            <li style={{ marginBottom: '0.5rem' }}>✓ Present your tickets at the event entrance</li>
            <li>✓ Have a great time!</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {slug && (
            <Link
              href={`/events/${slug}`}
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Back to Event
            </Link>
          )}
          <Link
            href="/events"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #1e40af 0%, #0f172a 100%)',
              color: 'white',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Browse More Events
          </Link>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '2rem' }}>
          Session ID: {sessionId}
        </p>
      </div>

      <style jsx>{`
        @keyframes successPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}

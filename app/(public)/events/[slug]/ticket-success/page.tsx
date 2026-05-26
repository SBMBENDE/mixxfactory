/**
 * Ticket Purchase Success Page
 * Fetches and displays confirmed ticket details after Stripe Checkout.
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';

interface TicketInfo {
  ticketCode: string;
  eventTitle: string;
  eventSlug: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  status: string;
}

export default function TicketSuccessPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const sessionId = searchParams?.get('session_id');
  const code = searchParams?.get('code');
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch_ = async () => {
      if (!sessionId && !code) {
        setError('No ticket reference found');
        setLoading(false);
        return;
      }
      try {
        const qs = sessionId ? `session_id=${sessionId}` : `code=${code}`;
        const res = await fetch(`/api/stripe/tickets/verify?${qs}`);
        if (!res.ok) {
          // Webhook may not have fired yet — keep polling briefly
          throw new Error('pending');
        }
        const data = await res.json();
        setTicket(data);
      } catch (err: any) {
        if (err.message === 'pending') {
          // Retry once after 2s to allow webhook to land
          setTimeout(async () => {
            try {
              const qs = sessionId ? `session_id=${sessionId}` : `code=${code}`;
              const res = await fetch(`/api/stripe/tickets/verify?${qs}`);
              const data = await res.json();
              if (res.ok) setTicket(data);
              else setError('Could not retrieve ticket details. Check your email for confirmation.');
            } catch {
              setError('Could not retrieve ticket details. Check your email for confirmation.');
            } finally {
              setLoading(false);
            }
          }, 2000);
          return;
        }
        setError('Could not retrieve ticket details. Check your email for confirmation.');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [sessionId, code]);

  if (loading) {
    return (
      <section style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '80vh' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</div>
        <p style={{ color: '#6b7280' }}>Confirming your tickets...</p>
      </section>
    );
  }

  if (error && !ticket) {
    return (
      <section style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '80vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
            Payment Successful!
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error}</p>
          <Link href={`/events/${slug}`} style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '600' }}>
            Back to Event
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '80vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Success icon */}
        <div style={{ width: '100px', height: '100px', margin: '0 auto 2rem', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
          ✓
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
          You&apos;re In! 🎉
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem' }}>
          {ticket ? `${ticket.customerName}, your tickets for ${ticket.eventTitle} are confirmed.` : 'Your tickets are confirmed!'}
        </p>

        {ticket && (
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {/* Ticket code */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px dashed #86efac' }}>
              <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600', marginBottom: '0.25rem', letterSpacing: '0.1em' }}>TICKET REFERENCE</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#15803d', letterSpacing: '0.05em', fontFamily: 'monospace' }}>{ticket.ticketCode}</p>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <Row label="Event" value={ticket.eventTitle} />
              <Row label="Ticket Type" value={ticket.ticketType} />
              <Row label="Quantity" value={`${ticket.quantity} ticket${ticket.quantity > 1 ? 's' : ''}`} />
              {ticket.totalAmount > 0 && (
                <Row label="Total Paid" value={`${ticket.currency} ${ticket.totalAmount.toFixed(2)}`} />
              )}
              <Row label="Email" value={ticket.customerEmail} />
              <Row label="Status" value={ticket.status === 'confirmed' ? '✅ Confirmed' : '⏳ Processing'} />
            </div>
          </div>
        )}

        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
          📧 A confirmation has been sent to {ticket?.customerEmail || 'your email'}. Present your ticket code at the door.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={`/events/${slug}`} style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'rgb(249,115,22)', color: 'white', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '600' }}>
            Back to Event
          </Link>
          <Link href="/events" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: '#e5e7eb', color: '#1f2937', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '600' }}>
            Browse Events
          </Link>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ color: '#1f2937', fontWeight: '500', fontSize: '0.875rem' }}>{value}</span>
    </div>
  );
}

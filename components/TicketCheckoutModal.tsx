/**
 * Ticket Checkout Modal Component
 * Handles ticket selection and Stripe Checkout integration
 */

'use client';

import { useState } from 'react';

interface TicketOption {
  label: string;
  price: number;
  currency: string;
  quantity?: number;
}

interface TicketCheckoutModalProps {
  eventId: string;
  eventTitle: string;
  tickets: TicketOption[];
  isOpen: boolean;
  onClose: () => void;
  ticketingEnabled?: boolean;
}

export default function TicketCheckoutModal({
  eventId,
  eventTitle,
  tickets,
  isOpen,
  onClose,
  ticketingEnabled = false,
}: TicketCheckoutModalProps) {
  const [selectedTicketType, setSelectedTicketType] = useState(tickets[0]?.label || '');
  const [quantity, setQuantity] = useState(1);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedTicket = tickets.find((t) => t.label === selectedTicketType);
  const selectedTicketQuantity = selectedTicket?.quantity;
  const selectedTicketAvailable = selectedTicketQuantity == null ? null : Math.max(0, selectedTicketQuantity);
  const isSoldOut = selectedTicketAvailable === 0;
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;

  const handleCheckout = async () => {
    if (!customerEmail || !customerName) {
      setError('Please fill in all fields');
      return;
    }

    if (!selectedTicket) {
      setError('Please select a ticket type');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/stripe/tickets/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketType: selectedTicketType,
          quantity,
          customerEmail,
          customerName,
        }),
      });

      // Check if response is OK before parsing JSON
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Checkout API error:', errorText);

        let message = `Failed to create checkout session (${res.status})`;
        try {
          const parsedError = JSON.parse(errorText);
          if (parsedError?.error) {
            message = parsedError.error;
          }
        } catch {
          // Non-JSON response, keep default message
        }

        setError(message);
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

      if (data.success && data.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (!ticketingEnabled) return null; // Silently hide if not enabled (shouldn't happen)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
            Buy Tickets
          </h2>
          <button
            onClick={onClose}
            style={{
              fontSize: '1.5rem',
              color: '#6b7280',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          {eventTitle}
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '0.375rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Ticket Type Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Ticket Type
          </label>
          <select
            value={selectedTicketType}
            onChange={(e) => setSelectedTicketType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          >
            {tickets.map((ticket) => (
              <option key={ticket.label} value={ticket.label}>
                {ticket.label} - {ticket.currency} {ticket.price}
                {ticket.quantity !== undefined && ` (${Math.max(0, ticket.quantity)} available)`}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max={selectedTicketAvailable ?? 20}
            value={quantity}
            onChange={(e) => {
              const nextValue = Math.max(1, parseInt(e.target.value, 10) || 1);
              const cap = selectedTicketAvailable ?? 20;
              setQuantity(Math.min(nextValue, cap));
            }}
            disabled={isSoldOut}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              backgroundColor: isSoldOut ? '#f9fafb' : 'white',
            }}
          />
          {isSoldOut && (
            <p style={{ color: '#b91c1c', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              This ticket type is sold out.
            </p>
          )}
        </div>

        {/* Customer Name */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Your Name *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Full Name"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Customer Email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Your Email *
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="email@example.com"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Total Price */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#6b7280' }}>Subtotal</span>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>
              {selectedTicket?.currency} {totalPrice.toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '600', color: '#1f2937' }}>Total</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
              {selectedTicket?.currency} {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={loading || !customerEmail || !customerName || isSoldOut}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: loading || !customerEmail || !customerName || isSoldOut ? '#9ca3af' : '#2563eb',
            color: 'white',
            borderRadius: '0.375rem',
            fontWeight: '600',
            border: 'none',
            fontSize: '1rem',
            cursor: loading || !customerEmail || !customerName || isSoldOut ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Processing...' : isSoldOut ? 'Sold Out' : 'Proceed to Payment'}
        </button>

        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem', textAlign: 'center' }}>
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}

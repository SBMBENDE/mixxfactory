/**
 * Client Booking Page for Professional
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Slot {
  start: string;
  end: string;
  available: boolean;
}

export default function BookProfessionalPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`/api/professionals/${slug}/slots`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load slots');
        setSlots(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load slots');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [slug]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/professionals/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: selectedSlot.start, end: selectedSlot.end }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Booking failed');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push(`/professionals/${slug}`), 2000);
    } catch (err) {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>Book a Session</h1>
      {loading ? (
        <p>Loading available slots...</p>
      ) : error ? (
        <div style={{ color: '#dc2626', marginBottom: 16 }}>{error}</div>
      ) : success ? (
        <div style={{ color: '#15803d', marginBottom: 16 }}>Booking successful! Redirecting...</div>
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Available Slots</h2>
            {slots.length === 0 ? <p>No slots available.</p> : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {slots.map((slot, idx) => (
                  <li key={idx} style={{ marginBottom: 10 }}>
                    <button
                      type="button"
                      disabled={!slot.available || submitting}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: 8,
                        border: selectedSlot === slot ? '2px solid #2563eb' : '1px solid #d1d5db',
                        background: slot.available ? (selectedSlot === slot ? '#dbeafe' : '#fff') : '#f3f4f6',
                        color: slot.available ? '#111827' : '#9ca3af',
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        fontWeight: 500,
                        width: '100%',
                        textAlign: 'left',
                      }}
                    >
                      {new Date(slot.start).toLocaleString()} - {new Date(slot.end).toLocaleTimeString()}
                      {!slot.available && ' (Unavailable)'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            disabled={!selectedSlot || submitting}
            onClick={handleBook}
            style={{
              padding: '0.75rem 2rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: !selectedSlot || submitting ? 'not-allowed' : 'pointer',
              opacity: !selectedSlot || submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Booking...' : 'Book Selected Slot'}
          </button>
        </>
      )}
    </div>
  );
}

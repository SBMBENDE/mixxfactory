/**
 * Review form component for clients to submit reviews
 */

'use client';

import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface ReviewFormProps {
  professionalId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ professionalId, onSuccess }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    rating: 5,
    title: '',
    comment: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const t = useTranslations();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          professionalId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: t.reviews.submitSuccess });
        setFormData({ clientName: '', clientEmail: '', rating: 5, title: '', comment: '' });
        if (onSuccess) onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || t.reviews.submitError });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.reviews.submitError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>{t.reviews.leaveReview}</h3>

      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '0.375rem',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
          {t.reviews.yourName} *
        </label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          required
          minLength={2}
          maxLength={100}
          style={{
            width: '100%',
            padding: '0.625rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
          {t.reviews.yourEmail} *
        </label>
        <input
          type="email"
          name="clientEmail"
          value={formData.clientEmail}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '0.625rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
          {t.reviews.rating} *
        </label>
        <select
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.625rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
        >
          <option value={5}>5 ⭐ - Excellent</option>
          <option value={4}>4 ⭐ - Good</option>
          <option value={3}>3 ⭐ - Average</option>
          <option value={2}>2 ⭐ - Fair</option>
          <option value={1}>1 ⭐ - Poor</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
          {t.reviews.reviewTitle} *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={200}
          placeholder="Summarize your experience"
          style={{
            width: '100%',
            padding: '0.625rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.375rem' }}>
          {t.reviews.reviewComment} *
        </label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          placeholder="Share your experience with this professional..."
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '0.75rem 2rem',
          backgroundColor: loading ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? t.reviews.submitting : t.reviews.submit}
      </button>
    </form>
  );
}

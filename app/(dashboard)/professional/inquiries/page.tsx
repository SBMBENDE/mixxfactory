/**
 * Professional Inquiries Inbox Page
 */

'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faEnvelopeOpen,
  faReply,
  faCheckCircle,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';

interface Inquiry {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  replies: Array<{
    text: string;
    timestamp: string;
    from: 'professional' | 'client';
  }>;
  createdAt: string;
}

export default function InquiriesPage() {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`/api/professional/inquiries?filter=${filter}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setInquiries(data.data);
      }
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);

    // Mark as read if new
    if (inquiry.status === 'new') {
      await fetch(`/api/professional/inquiries/${inquiry._id}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      fetchInquiries();
    }
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyText.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/professional/inquiries/${selectedInquiry._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reply: replyText }),
      });

      if (res.ok) {
        setReplyText('');
        fetchInquiries();
        // Update selected inquiry
        const data = await res.json();
        setSelectedInquiry(data.data);
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      new: { bg: '#fee2e2', color: '#991b1b', text: 'New' },
      read: { bg: '#dbeafe', color: '#1e40af', text: 'Read' },
      replied: { bg: '#dcfce7', color: '#166534', text: 'Replied' },
      closed: { bg: '#f3f4f6', color: '#4b5563', text: 'Closed' },
    };
    const style = styles[status] || styles.new;
    return (
      <span
        style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: style.bg,
          color: style.color,
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
        }}
      >
        {style.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#6b7280' }}>Loading inquiries...</div>
      </div>
    );
  }

  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Inquiries Inbox
          {newCount > 0 && (
            <span
              style={{
                marginLeft: '1rem',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '9999px',
                fontSize: '1rem',
              }}
            >
              {newCount}
            </span>
          )}
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage client inquiries and communications
        </p>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          <FontAwesomeIcon icon={faFilter} style={{ marginRight: '0.5rem' }} />
          Filter Inquiries
        </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          <option value="all">All Inquiries ({inquiries.length})</option>
          <option value="new">New ({newCount})</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* Inbox Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', height: '600px' }}>
        {/* Inbox List */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflowY: 'auto',
          }}
        >
          {inquiries.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
              No inquiries yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {inquiries.map((inquiry) => (
                <button
                  key={inquiry._id}
                  onClick={() => handleSelectInquiry(inquiry)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    textAlign: 'left',
                    border: selectedInquiry?._id === inquiry._id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    backgroundColor: inquiry.status === 'new' ? '#fef3c7' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = inquiry.status === 'new' ? '#fef3c7' : 'white';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{inquiry.clientName}</p>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '0.25rem', fontWeight: '500' }}>
                    {inquiry.subject}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inquiry.message}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Inquiry Detail */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!selectedInquiry ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
              }}
            >
              <p>Select an inquiry to view details</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedInquiry.subject}</h3>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <p style={{ marginBottom: '0.25rem' }}>
                    <strong>From:</strong> {selectedInquiry.clientName}
                  </p>
                  <p style={{ marginBottom: '0.25rem' }}>
                    <strong>Email:</strong> {selectedInquiry.clientEmail}
                  </p>
                  {selectedInquiry.clientPhone && (
                    <p style={{ marginBottom: '0.25rem' }}>
                      <strong>Phone:</strong> {selectedInquiry.clientPhone}
                    </p>
                  )}
                  <p>
                    <strong>Date:</strong> {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Message Thread */}
              <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                {/* Original Message */}
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Original message:
                  </p>
                  <p style={{ color: '#1f2937', lineHeight: '1.6' }}>{selectedInquiry.message}</p>
                </div>

                {/* Replies */}
                {selectedInquiry.replies.map((reply, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      backgroundColor: reply.from === 'professional' ? '#eff6ff' : '#f9fafb',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      borderLeft: `3px solid ${reply.from === 'professional' ? '#2563eb' : '#6b7280'}`,
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                      {reply.from === 'professional' ? 'You replied' : 'Client replied'} •{' '}
                      {new Date(reply.timestamp).toLocaleString()}
                    </p>
                    <p style={{ color: '#1f2937', lineHeight: '1.6' }}>{reply.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  <FontAwesomeIcon icon={faReply} style={{ marginRight: '0.5rem' }} />
                  Send Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    marginBottom: '0.75rem',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: sending || !replyText.trim() ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

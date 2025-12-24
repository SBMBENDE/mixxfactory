/**
 * Professional Dashboard Home
 * Main dashboard with overview statistics and quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEnvelope,
  faStar,
  faChartLine,
  faEdit,
  faCrown,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

interface DashboardStats {
  profile: {
    name: string;
    slug: string;
    verified: boolean;
    subscriptionTier: string;
    profileCompletionPercentage: number;
  };
  analytics: {
    viewsThisMonth: number;
    viewsLastMonth: number;
    contactClicks: number;
    searchImpressions: number;
  };
  reviews: {
    total: number;
    averageRating: number;
    pending: number;
    recent: Array<{
      _id: string;
      clientName: string;
      rating: number;
      title: string;
      createdAt: string;
    }>;
  };
  inquiries: {
    total: number;
    new: number;
    recent: Array<{
      _id: string;
      clientName: string;
      subject: string;
      status: string;
      createdAt: string;
    }>;
  };
}

export default function ProfessionalDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/professional/dashboard', {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Failed to load dashboard');
        }

        const data = await res.json();
        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#6b7280' }}>Loading dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#dc2626' }}>{error || 'Failed to load dashboard'}</div>
      </div>
    );
  }

  const viewsChange = stats.analytics.viewsThisMonth - stats.analytics.viewsLastMonth;
  const viewsChangePercent = stats.analytics.viewsLastMonth > 0
    ? ((viewsChange / stats.analytics.viewsLastMonth) * 100).toFixed(1)
    : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Dashboard Overview
        </h1>
        <p style={{ color: '#6b7280' }}>
          Welcome to your professional dashboard. Manage your profile, track performance, and engage with clients.
        </p>
      </div>

      {/* Profile Status Banner */}
      <div
        style={{
          backgroundColor: stats.profile.verified ? '#dcfce7' : '#fef3c7',
          border: `1px solid ${stats.profile.verified ? '#86efac' : '#fde68a'}`,
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FontAwesomeIcon
            icon={stats.profile.verified ? faCheckCircle : faExclamationTriangle}
            style={{ fontSize: '1.5rem', color: stats.profile.verified ? '#15803d' : '#92400e' }}
          />
          <div>
            <p style={{ fontWeight: '600', color: stats.profile.verified ? '#15803d' : '#92400e' }}>
              {stats.profile.verified ? 'Profile Verified' : 'Profile Not Verified'}
            </p>
            <p style={{ fontSize: '0.875rem', color: stats.profile.verified ? '#166534' : '#78350f' }}>
              {stats.profile.verified
                ? 'Your profile has been verified by our team'
                : 'Submit verification documents to get verified'}
            </p>
          </div>
        </div>
        <Link
          href="/professional/profile"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            textDecoration: 'none',
            color: '#374151',
          }}
        >
          View Profile
        </Link>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Views */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Profile Views
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.analytics.viewsThisMonth.toLocaleString()}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: viewsChange >= 0 ? '#15803d' : '#dc2626',
                  marginTop: '0.25rem',
                }}
              >
                {viewsChange >= 0 ? '↑' : '↓'} {Math.abs(Number(viewsChangePercent))}% from last month
              </p>
            </div>
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                borderRadius: '0.5rem',
              }}
            >
              <FontAwesomeIcon icon={faEye} style={{ fontSize: '1.5rem', color: '#2563eb' }} />
            </div>
          </div>
        </div>

        {/* Contact Clicks */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Contact Clicks
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.analytics.contactClicks}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                All time
              </p>
            </div>
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.5rem',
              }}
            >
              <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '1.5rem', color: '#15803d' }} />
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Average Rating
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.reviews.averageRating.toFixed(1)} ⭐
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {stats.reviews.total} reviews
              </p>
            </div>
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#fef3c7',
                borderRadius: '0.5rem',
              }}
            >
              <FontAwesomeIcon icon={faStar} style={{ fontSize: '1.5rem', color: '#d97706' }} />
            </div>
          </div>
        </div>

        {/* Inquiries */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                New Inquiries
              </p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.inquiries.new}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {stats.inquiries.total} total
              </p>
            </div>
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                borderRadius: '0.5rem',
              }}
            >
              <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '1.5rem', color: '#dc2626' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <Link
            href={`/professionals/${stats.profile.slug}/edit`}
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: '#374151',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <FontAwesomeIcon icon={faEdit} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: '600' }}>Edit Profile</p>
          </Link>

          <Link
            href="/professional/analytics"
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: '#374151',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <FontAwesomeIcon icon={faChartLine} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: '600' }}>View Analytics</p>
          </Link>

          <Link
            href="/professional/subscription"
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: '#374151',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <FontAwesomeIcon icon={faCrown} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: '600' }}>Upgrade Plan</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Recent Reviews */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Reviews</h3>
            <Link href="/professional/reviews" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {stats.reviews.recent.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No reviews yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.reviews.recent.map((review) => (
                <div key={review._id} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: '600' }}>{review.clientName}</p>
                    <p style={{ color: '#d97706' }}>{'⭐'.repeat(review.rating)}</p>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{review.title}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Inquiries</h3>
            <Link href="/professional/inquiries" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          {stats.inquiries.recent.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No inquiries yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.inquiries.recent.map((inquiry) => (
                <div key={inquiry._id} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: '600' }}>{inquiry.clientName}</p>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: inquiry.status === 'new' ? '#fee2e2' : '#dcfce7',
                        color: inquiry.status === 'new' ? '#991b1b' : '#166534',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {inquiry.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{inquiry.subject}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

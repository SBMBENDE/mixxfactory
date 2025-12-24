/**
 * Professional Analytics Page
 * Detailed analytics with charts and metrics
 */

'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faMousePointer, faSearch, faCalendar } from '@fortawesome/free-solid-svg-icons';

interface AnalyticsData {
  summary: {
    totalViews: number;
    thisMonth: number;
    lastMonth: number;
    contactClicks: number;
    searchImpressions: number;
  };
  daily: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
  topSearchTerms: Array<{
    term: string;
    count: number;
  }>;
  topReferrers: Array<{
    source: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/professional/analytics?days=${dateRange}`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.data);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#6b7280' }}>Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', color: '#dc2626' }}>Failed to load analytics</div>
      </div>
    );
  }

  const changePercent = analytics.summary.lastMonth > 0
    ? ((analytics.summary.thisMonth - analytics.summary.lastMonth) / analytics.summary.lastMonth * 100).toFixed(1)
    : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Analytics & Insights
        </h1>
        <p style={{ color: '#6b7280' }}>
          Track your profile performance and understand your audience
        </p>
      </div>

      {/* Date Range Selector */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          <FontAwesomeIcon icon={faCalendar} style={{ marginRight: '0.5rem' }} />
          Time Period
        </label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Views */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Views</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.summary.totalViews.toLocaleString()}</p>
              <p style={{ fontSize: '0.875rem', color: Number(changePercent) >= 0 ? '#15803d' : '#dc2626', marginTop: '0.25rem' }}>
                {Number(changePercent) >= 0 ? '↑' : '↓'} {Math.abs(Number(changePercent))}% vs last period
              </p>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
              <FontAwesomeIcon icon={faEye} style={{ fontSize: '1.5rem', color: '#2563eb' }} />
            </div>
          </div>
        </div>

        {/* Contact Clicks */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Contact Clicks</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.summary.contactClicks}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {analytics.summary.totalViews > 0 
                  ? `${((analytics.summary.contactClicks / analytics.summary.totalViews) * 100).toFixed(1)}% conversion`
                  : 'No data'}
              </p>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
              <FontAwesomeIcon icon={faMousePointer} style={{ fontSize: '1.5rem', color: '#15803d' }} />
            </div>
          </div>
        </div>

        {/* Search Impressions */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Search Impressions</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analytics.summary.searchImpressions}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Times shown in search
              </p>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem' }}>
              <FontAwesomeIcon icon={faSearch} style={{ fontSize: '1.5rem', color: '#d97706' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Views Over Time */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Views Over Time</h3>
          {analytics.daily.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No data available</p>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              {analytics.daily.slice(-14).map((day, index) => {
                const maxViews = Math.max(...analytics.daily.map(d => d.views));
                const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${height}%`,
                        backgroundColor: '#2563eb',
                        borderRadius: '0.25rem 0.25rem 0 0',
                        minHeight: '2px',
                      }}
                      title={`${day.views} views`}
                    />
                    <p style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.5rem', transform: 'rotate(-45deg)' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Search Terms */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Top Search Terms</h3>
          {analytics.topSearchTerms.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics.topSearchTerms.map((term, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem' }}>{term.term}</span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}>
                    {term.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Traffic Sources */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Traffic Sources</h3>
        {analytics.topReferrers.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No referrer data available</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {analytics.topReferrers.map((referrer, index) => (
              <div key={index} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>{referrer.source}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{referrer.count}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>visits</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

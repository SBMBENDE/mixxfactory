/**
 * Dashboard home page
 */

'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Professionals', value: '0', icon: '👥' },
    { label: 'Total Categories', value: '0', icon: '🏷️' },
    { label: 'Featured Listings', value: '0', icon: '⭐' },
    { label: 'Active Professionals', value: '0', icon: '✅' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profsRes, catsRes] = await Promise.all([
          fetch('/api/admin/professionals?limit=1000', { credentials: 'include' }),
          fetch('/api/admin/categories', { credentials: 'include' }),
        ]);

        const profsData = profsRes.ok ? await profsRes.json() : null;
        const catsData = catsRes.ok ? await catsRes.json() : null;

        const professionals = profsData?.data?.data || [];
        const categories = catsData?.data || [];

        const totalProfessionals = professionals.length;
        const totalCategories = categories.length;
        const featuredCount = professionals.filter((p: any) => p.featured).length;
        const activeCount = professionals.filter((p: any) => p.active).length;

        setStats([
          { label: 'Total Professionals', value: totalProfessionals.toString(), icon: '👥' },
          { label: 'Total Categories', value: totalCategories.toString(), icon: '🏷️' },
          { label: 'Featured Listings', value: featuredCount.toString(), icon: '⭐' },
          { label: 'Active Professionals', value: activeCount.toString(), icon: '✅' },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem' }}>Admin Dashboard</h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
            <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{stat.label}</p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
              {loading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Activity</h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
          <p>No recent activity</p>
        </div>
      </div>
    </div>
  );
}

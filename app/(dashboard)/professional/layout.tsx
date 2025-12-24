/**
 * Professional Dashboard Layout
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faStar,
  faEnvelope,
  faCog,
  faUser,
  faCrown,
  faSignOutAlt,
  faBars,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [professionalName, setProfessionalName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          router.push('/auth/login');
          return;
        }

        const data = await res.json();
        if (data.data?.accountType !== 'professional' && data.data?.role !== 'admin') {
          router.push('/');
          return;
        }

        // Get professional profile
        const profRes = await fetch('/api/professional/my-profile', {
          credentials: 'include',
        });
        
        if (profRes.ok) {
          const profData = await profRes.json();
          setProfessionalName(profData.data?.name || 'Professional');
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.25rem', color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  const navLinks = [
    { href: '/professional', icon: faChartLine, label: 'Dashboard' },
    { href: '/professional/analytics', icon: faChartLine, label: 'Analytics' },
    { href: '/professional/reviews', icon: faStar, label: 'Reviews' },
    { href: '/professional/inquiries', icon: faEnvelope, label: 'Inquiries' },
    { href: '/professional/profile', icon: faUser, label: 'My Profile' },
    { href: '/professional/subscription', icon: faCrown, label: 'Subscription' },
    { href: '/professional/settings', icon: faCog, label: 'Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 50,
          display: 'block',
          padding: '0.5rem',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
        }}
        className="md:hidden"
      >
        <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
      </button>

      {/* Sidebar */}
      <aside
        style={{
          width: '16rem',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          padding: '2rem 1rem',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 40,
        }}
        className="md:translate-x-0"
      >
        {/* Logo/Brand */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
              MixxFactory
            </h1>
          </Link>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Professional Dashboard
          </p>
        </div>

        {/* Welcome Message */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
            Welcome back,
          </p>
          <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e3a8a' }}>
            {professionalName}
          </p>
        </div>

        {/* Navigation Links */}
        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                marginBottom: '0.25rem',
                borderRadius: '0.375rem',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
              }}
            >
              <FontAwesomeIcon icon={link.icon} style={{ width: '1rem' }} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.75rem 1rem',
            marginTop: '2rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            color: '#dc2626',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: '16rem',
          padding: '2rem',
        }}
        className="ml-0 md:ml-64"
      >
        {children}
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
          }}
          className="md:hidden"
        />
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          aside {
            transform: translateX(0) !important;
          }
          main {
            margin-left: 16rem;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Dashboard Access Middleware Component
 * Checks if user's subscription tier allows dashboard access
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { canAccessDashboard } from '@/lib/utils/tier-access';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faLock } from '@fortawesome/free-solid-svg-icons';

interface DashboardGuardProps {
  children: React.ReactNode;
}

export function DashboardGuard({ children }: DashboardGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [tier, setTier] = useState<string>('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if user is authenticated
        const authRes = await fetch('/api/auth/me', { 
          credentials: 'include',
          cache: 'no-store' // Force fresh data
        });
        if (!authRes.ok) {
          router.push('/login');
          return;
        }

        // Check professional profile and subscription tier
        const profileRes = await fetch('/api/professional/my-profile', { 
          credentials: 'include',
          cache: 'no-store' // Force fresh data
        });
        
        if (!profileRes.ok) {
          router.push('/register/professional');
          return;
        }

        const profileData = await profileRes.json();
        const subscriptionTier = profileData.data?.subscriptionTier || 'free';
        setTier(subscriptionTier);

        // Check if tier allows dashboard access
        if (canAccessDashboard(subscriptionTier as any)) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Dashboard access check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: '#6b7280' }}>Checking access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '2rem'
      }}>
        <div style={{ 
          maxWidth: '600px', 
          backgroundColor: 'white', 
          borderRadius: '1rem', 
          padding: '3rem', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            marginBottom: '1.5rem'
          }}>
            <FontAwesomeIcon icon={faLock} style={{ fontSize: '2rem', color: '#f59e0b' }} />
          </div>
          
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111' }}>
            Dashboard Access Restricted
          </h1>
          
          <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
            The professional dashboard is only available for paid subscribers.
          </p>
          
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            You're currently on the <strong style={{ color: '#111' }}>{tier} plan</strong>.
          </p>

          <div style={{ 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: '#111' }}>
              <FontAwesomeIcon icon={faCrown} style={{ color: '#f59e0b', marginRight: '0.5rem' }} />
              Upgrade to unlock:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#374151' }}>
              <li style={{ marginBottom: '0.5rem' }}>✓ Full dashboard access</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Gallery images (up to 15)</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Customer inquiries</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ Analytics & insights</li>
              <li>✓ Calendar management</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/checkout"
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FontAwesomeIcon icon={faCrown} />
              Upgrade Now
            </Link>
            
            <Link
              href="/professional/profile"
              style={{
                padding: '0.875rem 2rem',
                backgroundColor: '#e5e7eb',
                color: '#111',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

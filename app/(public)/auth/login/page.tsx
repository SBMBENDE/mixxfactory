/**
 * Login page
 */

'use client';

import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting login form with email:', email);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      console.log('Response received:', res.status, res.statusText);

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = data.error || data.message || 'Login failed';
        console.log('Login error:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('Login successful:', data);
      setLoading(false);
      
      // Wait a brief moment for cookie to be properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on user role
      const userRole = data.data?.role;
      console.log('User role:', userRole);
      
      if (userRole === 'admin') {
        console.log('Redirecting admin to dashboard...');
        window.location.href = '/dashboard';
      } else if (userRole === 'professional' || userRole === 'user') {
        console.log('Redirecting professional/user to directory...');
        window.location.href = '/directory';
      } else {
        console.log('Unknown role, redirecting to home...');
        window.location.href = '/';
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      console.error('Login error:', err);
      setError(errorMsg);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t.auth.login}</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{t.auth.signIn}</p>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{t.auth.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{t.auth.password}</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.5rem', paddingRight: '2.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '1.25rem',
                    padding: '0.25rem 0.5rem',
                  }}
                  title={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                fontWeight: '600',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? t.auth.redirecting : t.auth.signIn}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t.auth.noAccount}
            </p>
            <a
              href="/auth/register"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
            >
              {t.auth.createAccountLink}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

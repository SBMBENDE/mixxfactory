/**
 * User Registration Page
 */

'use client';

import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'professional' | 'user'>('professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = useTranslations();

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t.auth.passwordMatch);
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError(t.auth.passwordLength);
      setLoading(false);
      return;
    }

    try {
      console.log('Registering with email:', email, 'role:', role);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
        credentials: 'include',
      });

      console.log('Response received:', res.status, res.statusText);

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = data.error || data.message || 'Registration failed';
        console.log('Registration error:', errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('Registration successful:', data);
      setSuccess(true);
      setLoading(false);

      // Redirect to email verification page with token after 2 seconds
      const verificationToken = data.data?.verificationToken;
      setTimeout(() => {
        const redirectUrl = verificationToken
          ? `/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(verificationToken)}`
          : `/auth/verify-email?email=${encodeURIComponent(email)}`;
        window.location.href = redirectUrl;
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      console.error('Registration error:', err);
      setError(errorMsg);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#047857' }}>{t.auth.accountCreated}</h1>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{t.auth.redirecting}</p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>If you are not redirected, please wait.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t.auth.createAccount}</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{t.auth.joingMixxFactory}</p>

          <form onSubmit={handleRegister}>
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
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{t.auth.accountType}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'professional' | 'user')}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="professional">{t.auth.professional}</option>
                <option value="user">{t.auth.user}</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{t.auth.password}</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.5rem', paddingRight: '2.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white', boxSizing: 'border-box' }}
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
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{t.auth.passwordMin}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>{t.auth.confirmPassword}</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.5rem', paddingRight: '2.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: 'white', boxSizing: 'border-box' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  title={showConfirmPassword ? t.auth.hidePassword : t.auth.showPassword}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
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
              {loading ? t.common.loading : t.auth.createAccount}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {t.auth.haveAccount}
            </p>
            <a
              href="/auth/login"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
            >
              {t.auth.signIn}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Auth Modal Component - Login/Register for professionals
 */

'use client';

import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userId: string) => void;
  redirectUrl?: string; // Optional redirect after successful auth
  registerAsProfessional?: boolean; // If true, register as professional, else as user
}

export function AuthModal({ isOpen, onClose, onSuccess, redirectUrl, registerAsProfessional = true }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const t = useTranslations();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Handle forgot password separately
      if (mode === 'forgot-password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to send reset email');
          setLoading(false);
          return;
        }

        setSuccess('Password reset link sent! Check your email.');
        setLoading(false);
        // Clear form and switch back to login after 3 seconds
        setTimeout(() => {
          setMode('login');
          setFormData({ email: '', password: '', confirmPassword: '' });
          setSuccess('');
        }, 3000);
        return;
      }

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      
      const body: any = {
        email: formData.email,
        password: formData.password,
      };

      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError(t.auth.passwordMatch);
          setLoading(false);
          return;
        }
        // Only set role to professional if explicitly requested
        body.role = registerAsProfessional ? 'professional' : 'user';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || (mode === 'login' ? t.auth.loginFailed : t.auth.registerFailed));
        setLoading(false);
        return;
      }

      // Success
      console.log('✅ Auth successful! Response:', JSON.stringify(data, null, 2));
      console.log('🔑 User role from response:', data.data?.role);
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(data.data.userId);
      }

      // Wait for cookie to propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect based on mode and user role
      if (mode === 'login') {
        const userRole = data.data.role;
        console.log('🎯 REDIRECT - userRole:', userRole, 'type:', typeof userRole);
        
        if (redirectUrl) {
          // If redirectUrl is specified, use it
          console.log('🔄 Redirecting to specified URL:', redirectUrl);
          window.location.replace(redirectUrl);
        } else if (userRole === 'admin') {
          console.log('🔵 Redirecting admin to /admin');
          window.location.replace('/admin');
        } else if (userRole === 'professional') {
          console.log('🟢 Redirecting professional to /professional');
          window.location.replace('/professional');
        } else {
          console.log('🟡 Redirecting user to /directory');
          window.location.replace('/directory');
        }
      } else {
        // After registration
        if (redirectUrl) {
          // If redirectUrl is specified, use it
          console.log('🔄 Redirecting to specified URL after registration:', redirectUrl);
          window.location.replace(redirectUrl);
        } else if (registerAsProfessional) {
          // Only redirect to professional registration if explicitly registering as professional
          window.location.replace('/register/professional');
        } else {
          // Regular user registration - refresh current page to update auth state
          window.location.reload();
        }
      }
    } catch (err) {
      setError(t.auth.networkError);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {mode === 'login' ? t.auth.login : mode === 'register' ? t.auth.register : 'Forgot Password'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ✕
          </button>
        </div>

        {/* Mode Tabs - Hide when in forgot-password mode */}
        {mode !== 'forgot-password' && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setMode('login')}
              style={{
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: mode === 'login' ? 'bold' : 'normal',
                color: mode === 'login' ? '#2563eb' : '#6b7280',
                borderBottom: mode === 'login' ? '2px solid #2563eb' : 'none',
              }}
            >
              {t.auth.login}
            </button>
            <button
              onClick={() => setMode('register')}
              style={{
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: mode === 'register' ? 'bold' : 'normal',
                color: mode === 'register' ? '#2563eb' : '#6b7280',
                borderBottom: mode === 'register' ? '2px solid #2563eb' : 'none',
              }}
            >
              {t.auth.register}
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#dcfce7',
              color: '#166534',
              borderRadius: '0.375rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}>
              {success}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.25rem',
            }}>
              {t.auth.email}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password field - hide in forgot-password mode */}
          {mode !== 'forgot-password' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.25rem',
                }}>
                  {t.auth.password}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      paddingRight: '2.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
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

              {/* Forgot password link - show only in login mode */}
              {mode === 'login' && (
                <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </>
          )}

          {mode === 'register' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.25rem',
              }}>
                {t.auth.confirmPassword}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    paddingRight: '2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
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
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              fontWeight: '600',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {loading 
              ? (mode === 'forgot-password' ? 'Sending...' : mode === 'login' ? t.auth.redirecting : t.auth.registering)
              : (mode === 'forgot-password' ? 'Send Reset Link' : mode === 'login' ? t.auth.login : t.auth.register)
            }
          </button>

          {/* Back to login from forgot password */}
          {mode === 'forgot-password' && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Back to Login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

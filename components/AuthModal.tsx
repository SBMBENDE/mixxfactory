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
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    setLoading(true);

    try {
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
        body.role = 'professional';
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
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(data.data.userId);
      }

      // Redirect based on mode
      if (mode === 'login') {
        window.location.href = '/directory';
      } else {
        window.location.href = '/register/professional';
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
            {mode === 'login' ? t.auth.login : t.auth.register}
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

        {/* Mode Tabs */}
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
            {loading ? (mode === 'login' ? t.auth.redirecting : t.auth.registering) : (mode === 'login' ? t.auth.login : t.auth.register)}
          </button>
        </form>
      </div>
    </div>
  );
}

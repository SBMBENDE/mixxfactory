/**
 * Professional Settings Page
 */

'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faShieldAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newInquiries: true,
    newReviews: true,
    monthlyReport: true,
    marketingEmails: false,
  });

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Settings
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage your account preferences and notification settings
        </p>
      </div>

      {/* Notifications Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FontAwesomeIcon icon={faBell} style={{ color: '#2563eb' }} />
          Notification Preferences
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
            { key: 'newInquiries', label: 'New Inquiries', desc: 'Get notified when you receive new client inquiries' },
            { key: 'newReviews', label: 'New Reviews', desc: 'Get notified when clients leave reviews' },
            { key: 'monthlyReport', label: 'Monthly Report', desc: 'Receive monthly performance summary' },
            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive tips, updates, and promotional offers' },
          ].map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem',
              }}
            >
              <div>
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.label}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.desc}</p>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                style={{
                  width: '3rem',
                  height: '1.5rem',
                  backgroundColor: settings[item.key as keyof typeof settings] ? '#2563eb' : '#d1d5db',
                  border: 'none',
                  borderRadius: '9999px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '0.125rem',
                    left: settings[item.key as keyof typeof settings] ? '1.625rem' : '0.125rem',
                    width: '1.25rem',
                    height: '1.25rem',
                    backgroundColor: 'white',
                    borderRadius: '9999px',
                    transition: 'all 0.2s',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FontAwesomeIcon icon={faShieldAlt} style={{ color: '#2563eb' }} />
          Privacy & Security
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            style={{
              padding: '1rem',
              textAlign: 'left',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Change Password</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Update your password to keep your account secure
            </p>
          </button>

          <button
            style={{
              padding: '1rem',
              textAlign: 'left',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Two-Factor Authentication</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Add an extra layer of security to your account
            </p>
          </button>

          <button
            style={{
              padding: '1rem',
              textAlign: 'left',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
          >
            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Privacy Settings</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Control who can see your profile and contact information
            </p>
          </button>
        </div>
      </div>

      {/* Language Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FontAwesomeIcon icon={faGlobe} style={{ color: '#2563eb' }} />
          Language & Region
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Language
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
              }}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Timezone
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
              }}
            >
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="America/New_York">New York (EST)</option>
            </select>
          </div>
        </div>

        <button
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

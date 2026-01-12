/**
 * SOS Help Page
 * Direct support for urgent issues
 * Structured form for admin triage
 */

'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLifeRing, 
  faCheck, 
  faExclamationTriangle,
  faClock,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

interface ProfileData {
  name: string;
  email: string;
  subscriptionTier: string;
}

type ReasonType = 
  | 'account-access'
  | 'payment-issue'
  | 'profile-blocked'
  | 'booking-calendar'
  | 'other-urgent';

export default function SOSHelpPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [reason, setReason] = useState<ReasonType | ''>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const maxChars = 800;
  const minChars = 20;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/professional/my-profile');
      const data = await res.json();

      if (data.success && data.data) {
        setProfile({
          name: data.data.name,
          email: data.data.email,
          subscriptionTier: data.data.subscriptionTier || 'free',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!reason) {
      setError('Please select a reason for your request');
      return;
    }

    if (message.length < minChars) {
      setError(`Please provide at least ${minChars} characters`);
      return;
    }

    if (message.length > maxChars) {
      setError(`Message is too long (max ${maxChars} characters)`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/professional/sos-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, message }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        setReason('');
        setMessage('');
      } else {
        setError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reasons: { value: ReasonType; label: string }[] = [
    { value: 'account-access', label: "I can't access my account" },
    { value: 'payment-issue', label: 'Payment or subscription issue' },
    { value: 'profile-blocked', label: 'Profile not visible / blocked' },
    { value: 'booking-calendar', label: 'Booking or calendar issue' },
    { value: 'other-urgent', label: 'Other urgent issue' },
  ];

  const isPro = profile?.subscriptionTier === 'pro';
  const responseTime = isPro ? '24 hours' : '48 hours';

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <FontAwesomeIcon icon={faCheck} className="text-2xl text-green-600 dark:text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Request Sent Successfully
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {isPro ? (
              <>
                Our priority support team will respond within <strong>24 hours</strong>.
              </>
            ) : (
              <>
                Our support team will respond within <strong>48 hours</strong>.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Submit Another Request
            </button>
            <a
              href="/professional"
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faLifeRing} className="text-3xl text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              SOS Help – Contact Support
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Need urgent help with your account or payments? Our support team will get back to you as soon as possible.
            </p>
            
            {/* Response Time Badge */}
            <div className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon={faClock} className="text-red-600 dark:text-red-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Response time: {responseTime}
              </span>
              {isPro && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded text-xs font-semibold">
                  <FontAwesomeIcon icon={faCrown} className="text-xs" />
                  Priority Support
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>SOS Help is for urgent account or payment-related issues.</strong><br />
          For general questions or feature requests, please check our Help Center (coming soon).
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-filled Info (Read-only) */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Your Account Information
            </h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Name</div>
                <div className="font-medium text-gray-900 dark:text-white">{profile?.name}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Email</div>
                <div className="font-medium text-gray-900 dark:text-white">{profile?.email}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Plan</div>
                <div className="font-medium text-gray-900 dark:text-white capitalize">
                  {profile?.subscriptionTier}
                </div>
              </div>
            </div>
          </div>

          {/* Reason Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What do you need help with? <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReasonType)}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a reason</option>
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Briefly describe the issue <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              maxLength={maxChars}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Please provide details about your issue..."
            />
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className={`${
                message.length < minChars 
                  ? 'text-red-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                Minimum {minChars} characters
              </span>
              <span className={`${
                message.length > maxChars - 50 
                  ? 'text-orange-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {message.length} / {maxChars}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-800 dark:text-red-200">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting || !reason || message.length < minChars}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-lg"
            >
              {submitting ? 'Sending...' : 'Send to Support'}
            </button>
            <a
              href="/professional"
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
            >
              Cancel
            </a>
          </div>

          {/* Trust Message */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Your information is confidential and will only be used to resolve your issue.
          </p>
        </form>
      </div>

      {/* When to Expect Response */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          What happens next?
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>✓ Your request is sent directly to our support team</li>
          <li>✓ You&apos;ll receive a confirmation email</li>
          <li>✓ We&apos;ll respond within {responseTime}</li>
          {!isPro && (
            <li className="text-blue-600 dark:text-blue-400">
              💡 Upgrade to PRO for 24-hour priority support
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

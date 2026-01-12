/**
 * Professional Messages - Coming Soon Page
 * Maintains user trust with clear communication
 * Provides workaround options and feature preview
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function MessagesPage() {
  const [contactInfo, setContactInfo] = useState<{ email?: string; phone?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch professional's contact info for workaround
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/professional/my-profile');
        if (res.ok) {
          const data = await res.json();
          setContactInfo({
            email: data.email,
            phone: data.phone,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">💬</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Messages
            </h1>
            <span className="inline-block mt-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-semibold">
              Coming Soon
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          We&apos;re building a powerful messaging system to help you connect with clients seamlessly. 
          In the meantime, clients can reach you through the contact information on your profile.
        </p>
      </div>

      {/* Temporary Workaround */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <span>📞</span>
          How Clients Can Reach You Now
        </h2>
        
        {loading ? (
          <p className="text-blue-700 dark:text-blue-300">Loading your contact info...</p>
        ) : (
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            {contactInfo?.email && (
              <p>
                <span className="font-medium">Email:</span>{' '}
                <a href={`mailto:${contactInfo.email}`} className="underline hover:text-blue-600">
                  {contactInfo.email}
                </a>
              </p>
            )}
            {contactInfo?.phone && (
              <p>
                <span className="font-medium">Phone:</span>{' '}
                <a href={`tel:${contactInfo.phone}`} className="underline hover:text-blue-600">
                  {contactInfo.phone}
                </a>
              </p>
            )}
            {!contactInfo?.email && !contactInfo?.phone && (
              <p>
                Add contact information to your{' '}
                <Link href="/professional/profile" className="underline font-medium hover:text-blue-600">
                  profile
                </Link>{' '}
                so clients can reach you.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Feature Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>✨</span>
          What&apos;s Coming
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="text-2xl">📥</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Unified Inbox</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All client messages in one place, organized by conversation
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🔔</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instant alerts when clients send you messages
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">📎</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">File Sharing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share documents, images, and contracts securely
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Quick Responses</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save and use templates for common questions
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Read Receipts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Know when clients have seen your messages
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Secure & Private</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                End-to-end encryption for sensitive conversations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Badge Teaser */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">👑</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                PRO Feature
              </h3>
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-xs font-semibold">
                PRO
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When the messaging system launches, it will be a PRO-exclusive feature with priority support, 
              unlimited conversations, and advanced analytics on response times and client engagement.
            </p>
            <Link 
              href="/professional/subscription"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              Upgrade to PRO
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mock Inbox Preview */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Inbox Preview (Coming Soon)
        </h2>
        
        <div className="space-y-3 opacity-50">
          {/* Mock message items */}
          {[
            { name: 'Sarah Johnson', time: '2 hours ago', preview: 'Hi! I&apos;m interested in booking your services for...' },
            { name: 'Michael Chen', time: '1 day ago', preview: 'Thank you for the quick response! When would you...' },
            { name: 'Emily Rodriguez', time: '3 days ago', preview: 'Could you provide more details about your pricing...' },
          ].map((msg, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {msg.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {msg.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {msg.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {msg.preview}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          This is a preview of what your inbox will look like
        </div>
      </div>
    </div>
  );
}

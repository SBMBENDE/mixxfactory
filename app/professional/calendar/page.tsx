/**
 * Professional Calendar Page
 * Manage availability calendar (Pro-only feature)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface ProfileData {
  subscriptionTier: string;
  availability: Record<string, boolean>;
}

export default function CalendarPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/professional/my-profile', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setProfile({
          subscriptionTier: data.data.subscriptionTier || 'free',
          availability: data.data.availability || {},
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSaveAvailability = async (availability: Record<string, boolean>) => {
    try {
      const res = await fetch('/api/professional/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ availability }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresUpgrade) {
          // Show upgrade prompt
          setError(data.error);
          return;
        }
        throw new Error(data.error || 'Failed to save availability');
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, availability } : null);
    } catch (err) {
      throw err; // Re-throw so component can handle it
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">Profile not found</p>
        </div>
      </div>
    );
  }

  const isProUser = profile.subscriptionTier === 'pro';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/professional/profile"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-4 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Profile
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Availability Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isProUser
                ? 'Manage your availability to help clients book you'
                : 'Upgrade to Pro to use the availability calendar'}
            </p>
          </div>

          {!isProUser && (
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              <FontAwesomeIcon icon={faCrown} />
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* Calendar Component */}
      <AvailabilityCalendar
        availability={profile.availability}
        onSave={handleSaveAvailability}
        readOnly={false}
        subscriptionTier={profile.subscriptionTier}
      />

      {/* Benefits section for non-Pro users */}
      {!isProUser && (
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Why use the Availability Calendar?
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Increase Bookings
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clients can see when you&apos;re available at a glance
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Save Time
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reduce back-and-forth messages about availability
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Look Professional
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show you&apos;re organized and easy to work with
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Stand Out
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Most competitors don&apos;t offer this level of transparency
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/checkout"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Unlock Calendar Feature - Upgrade Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

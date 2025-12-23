/**
 * Account Settings Page
 * /app/(dashboard)/account/settings/page.tsx
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountSettings from '@/components/auth/account-settings';
import ProfileCompletionTracker from '@/components/auth/profile-completion-tracker';

interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  language: 'en' | 'fr';
  theme: 'light' | 'dark';
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  preferences: UserPreferences;
  profileCompletion: {
    basicInfo: boolean;
    contactInfo: boolean;
    profilePicture: boolean;
    preferences: boolean;
  };
  profileCompletionPercentage: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSavePreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const response = await fetch('/api/auth/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Update local state
      if (user) {
        setUser({
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences,
          },
        });
      }

      // Apply theme change if needed
      if (preferences.theme && typeof document !== 'undefined') {
        const htmlElement = document.documentElement;
        if (preferences.theme === 'dark') {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save preferences');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{error || 'User data not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings & Preferences
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Signed in as {user.email}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Completion */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProfileCompletionTracker
                completion={user.profileCompletion}
                percentage={user.profileCompletionPercentage}
              />
            </div>
          </div>

          {/* Right Column: Settings */}
          <div className="lg:col-span-2">
            <AccountSettings
              initialPreferences={user.preferences}
              onSave={handleSavePreferences}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Profile Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <p className="text-gray-900 dark:text-white font-medium">{user.firstName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <p className="text-gray-900 dark:text-white font-medium">{user.lastName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {user.phone || 'Not provided'}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/account/profile')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

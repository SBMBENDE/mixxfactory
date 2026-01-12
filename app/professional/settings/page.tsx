/**
 * Professional Settings Page
 * Comprehensive settings management with tabbed interface
 * Sections: Account, Profile, Notifications, Billing, Privacy
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faIdCard, 
  faBell, 
  faCreditCard, 
  faShieldAlt,
  faCheck,
  faExclamationTriangle,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

type Tab = 'account' | 'profile' | 'notifications' | 'billing' | 'privacy';

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  subscriptionTier: string;
  subscriptionExpiry?: string;
  active: boolean;
  verified: boolean;
  location?: {
    city?: string;
    country?: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account form
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    profileVisibility: 'public' as 'public' | 'hidden',
    showContactInfo: true,
    city: '',
    country: '',
  });

  // Notifications form
  const [notificationsForm, setNotificationsForm] = useState({
    emailNotifications: true,
    bookingRequests: true,
    reviewAlerts: true,
    promotions: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/professional/my-profile');
      const data = await res.json();

      if (data.success && data.data) {
        setProfile(data.data);
        setAccountForm({
          name: data.data.name || '',
          email: data.data.email || '',
        });
        setProfileForm({
          profileVisibility: data.data.active ? 'public' : 'hidden',
          showContactInfo: !!(data.data.phone || data.data.email),
          city: data.data.location?.city || '',
          country: data.data.location?.country || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      // Simulate save - you'll integrate with actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account' as Tab, label: 'Account', icon: faUser },
    { id: 'profile' as Tab, label: 'Profile', icon: faIdCard },
    { id: 'notifications' as Tab, label: 'Notifications', icon: faBell },
    { id: 'billing' as Tab, label: 'Billing', icon: faCreditCard },
    { id: 'privacy' as Tab, label: 'Privacy', icon: faShieldAlt },
  ];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ⚙️ Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Tabs - Mobile: Dropdown, Desktop: Horizontal */}
      <div className="mb-6">
        {/* Mobile Dropdown */}
        <div className="md:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-sm" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          <FontAwesomeIcon icon={saveMessage.type === 'success' ? faCheck : faExclamationTriangle} />
          {saveMessage.text}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Account Information
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Update your account details and credentials
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={accountForm.email}
                onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This email is used for login and notifications
              </p>
            </div>

            {/* Change Password */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Password
              </h3>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Change Password
              </button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Update your password to keep your account secure
              </p>
            </div>

            {/* Delete Account */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. This action cannot be undone.
              </p>
              <button className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Profile Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Control how your profile appears to clients
              </p>
            </div>

            {/* Profile Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Profile Visibility
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${profileForm.profileVisibility === 'public' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={profileForm.profileVisibility === 'public'}
                    onChange={() => setProfileForm({ ...profileForm, profileVisibility: 'public' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Public</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Your profile is visible in search results and directory
                    </div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${profileForm.profileVisibility === 'hidden' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <input
                    type="radio"
                    name="visibility"
                    value="hidden"
                    checked={profileForm.profileVisibility === 'hidden'}
                    onChange={() => setProfileForm({ ...profileForm, profileVisibility: 'hidden' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Hidden</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Your profile won&apos;t appear in search (only accessible via direct link)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Show Contact Info */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input
                type="checkbox"
                id="showContact"
                checked={profileForm.showContactInfo}
                onChange={(e) => setProfileForm({ ...profileForm, showContactInfo: e.target.checked })}
                className="mt-1 w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="showContact" className="flex-1 cursor-pointer">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  Display Contact Information
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Show your phone number and email on your public profile
                </div>
              </label>
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={profileForm.country}
                  onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your country"
                />
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Choose what updates you want to receive
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="emailNotifs"
                  checked={notificationsForm.emailNotifications}
                  onChange={(e) => setNotificationsForm({ ...notificationsForm, emailNotifications: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="emailNotifs" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Email Notifications
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive general updates via email
                  </div>
                </label>
              </div>

              {/* Booking Requests */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="bookingRequests"
                  checked={notificationsForm.bookingRequests}
                  onChange={(e) => setNotificationsForm({ ...notificationsForm, bookingRequests: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="bookingRequests" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Booking Requests
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when clients want to book your services
                  </div>
                </label>
              </div>

              {/* Review Alerts */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="reviewAlerts"
                  checked={notificationsForm.reviewAlerts}
                  onChange={(e) => setNotificationsForm({ ...notificationsForm, reviewAlerts: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="reviewAlerts" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    New Reviews
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Be alerted when clients leave reviews
                  </div>
                </label>
              </div>

              {/* Promotions */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="promotions"
                  checked={notificationsForm.promotions}
                  onChange={(e) => setNotificationsForm({ ...notificationsForm, promotions: e.target.checked })}
                  className="mt-1 w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="promotions" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Promotions & Updates
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Receive news about new features and special offers
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Billing & Subscription
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Manage your subscription and billing information
              </p>
            </div>

            {/* Current Plan */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Current Plan
                    </h3>
                    {profile?.subscriptionTier === 'pro' && (
                      <FontAwesomeIcon icon={faCrown} className="text-amber-500" />
                    )}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 capitalize">
                    {profile?.subscriptionTier || 'Free'}
                  </div>
                </div>
                {profile?.subscriptionTier !== 'free' && profile?.subscriptionExpiry && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Renews on</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(profile.subscriptionExpiry).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {profile?.subscriptionTier === 'free' ? (
                  <Link
                    href="/professional/subscription"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Upgrade Plan
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/professional/subscription"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Change Plan
                    </Link>
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Cancel Subscription
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Payment History
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Payment history will appear here once you make your first payment
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY TAB */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Privacy & Data
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Control your privacy settings and data
              </p>
            </div>

            {/* Data Privacy */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Who Can See My Profile
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Control who can view your professional profile
                </p>
                <select className="w-full md:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="everyone">Everyone (Public)</option>
                  <option value="registered">Registered Users Only</option>
                  <option value="private">Private (Direct Link Only)</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Contact Information Privacy
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Choose whether to display your contact details publicly
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showEmailPublic"
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="showEmailPublic" className="text-sm text-gray-700 dark:text-gray-300">
                    Show email address on profile
                  </label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="showPhonePublic"
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="showPhonePublic" className="text-sm text-gray-700 dark:text-gray-300">
                    Show phone number on profile
                  </label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Data Export
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Download all your data in a portable format
                </p>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
                  Request Data Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button - Sticky on mobile */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-4 md:static bg-white dark:bg-gray-800">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-lg md:shadow-none"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={fetchProfile}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

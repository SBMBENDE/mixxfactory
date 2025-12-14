/**
 * Account Settings/Preferences Component
 * Allows users to manage their account preferences
 */

'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/client';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  language: 'en' | 'fr';
  theme: 'light' | 'dark';
}

interface AccountSettingsProps {
  initialPreferences: UserPreferences;
  onSave?: (preferences: Partial<UserPreferences>) => Promise<void>;
  isLoading?: boolean;
}

export function AccountSettings({
  initialPreferences,
  onSave,
  isLoading = false,
}: AccountSettingsProps) {
  const t = useTranslation();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleChange = (key: keyof UserPreferences, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(preferences);
      setHasChanges(false);
      setSaveMessage({
        type: 'success',
        text: 'Preferences saved successfully',
      });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save preferences',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account preferences and notification settings
        </p>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notifications
        </h3>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Email Notifications
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Receive updates about your account activity
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
                disabled={isLoading || isSaving}
              />
              <div
                className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer
                dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              />
            </label>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                SMS Notifications
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Receive text message updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
                disabled={isLoading || isSaving}
              />
              <div
                className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer
                dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              />
            </label>
          </div>

          {/* Marketing Emails */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Marketing Emails
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Receive promotional offers and updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.marketingEmails}
                onChange={(e) => handleChange('marketingEmails', e.target.checked)}
                className="sr-only peer"
                disabled={isLoading || isSaving}
              />
              <div
                className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4
                peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer
                dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Preferences Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preferences
        </h3>

        <div className="space-y-4">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => handleChange('language', e.target.value as 'en' | 'fr')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600
              rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              disabled:opacity-50"
              disabled={isLoading || isSaving}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Theme
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => handleChange('theme', 'light')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                border-2 transition-colors disabled:opacity-50
                ${
                  preferences.theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
                disabled={isLoading || isSaving}
              >
                <SunIcon className="w-5 h-5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => handleChange('theme', 'dark')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                border-2 transition-colors disabled:opacity-50
                ${
                  preferences.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
                disabled={isLoading || isSaving}
              >
                <MoonIcon className="w-5 h-5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Security
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Two-Factor Authentication
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.twoFactorEnabled}
              onChange={(e) => handleChange('twoFactorEnabled', e.target.checked)}
              className="sr-only peer"
              disabled={isLoading || isSaving}
            />
            <div
              className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4
              peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer
              dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
              after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
              after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
              after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            />
          </label>
        </div>
      </div>

      {/* Messages */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg mb-6 text-sm font-medium ${
            saveMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
          hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {hasChanges && (
          <button
            onClick={() => {
              setPreferences(initialPreferences);
              setHasChanges(false);
              setSaveMessage(null);
            }}
            disabled={isSaving || isLoading}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
            rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default AccountSettings;

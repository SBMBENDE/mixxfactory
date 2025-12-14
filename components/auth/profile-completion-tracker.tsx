/**
 * Profile Completion Tracker Component
 * Shows user's profile completion progress
 */

'use client';

import { useEffect, useState } from 'react';

interface ProfileCompletion {
  basicInfo: boolean;
  contactInfo: boolean;
  profilePicture: boolean;
  preferences: boolean;
}

interface ProfileCompletionTrackerProps {
  completion: ProfileCompletion;
  percentage: number;
}

interface CompletionStep {
  id: keyof ProfileCompletion;
  label: string;
  description: string;
  completed: boolean;
}

export function ProfileCompletionTracker({
  completion,
  percentage,
}: ProfileCompletionTrackerProps) {
  const [steps, setSteps] = useState<CompletionStep[]>([]);

  useEffect(() => {
    setSteps([
      {
        id: 'basicInfo',
        label: 'Basic Information',
        description: 'First and last name',
        completed: completion.basicInfo,
      },
      {
        id: 'contactInfo',
        label: 'Contact Information',
        description: 'Phone number',
        completed: completion.contactInfo,
      },
      {
        id: 'profilePicture',
        label: 'Profile Picture',
        description: 'Add your photo',
        completed: completion.profilePicture,
      },
      {
        id: 'preferences',
        label: 'Preferences',
        description: 'Language and notifications',
        completed: completion.preferences,
      },
    ]);
  }, [completion]);

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;

  return (
    <div className="w-full max-w-md">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete Your Profile
          </h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Completion Text */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {completedCount} of {totalSteps} steps completed
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              step.completed
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Checkbox */}
            <div
              className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${
                step.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
            {step.completed && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            </div>

            {/* Step Info */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${
                  step.completed
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-xs ${
                  step.completed
                    ? 'text-green-700 dark:text-green-200'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {step.description}
              </p>
            </div>

            {/* Status Badge */}
            {step.completed && (
              <div className="flex-shrink-0 text-green-600 dark:text-green-400 text-xs font-medium">
                Done
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {percentage === 100 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            ✨ Profile Complete! You&apos;re all set.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProfileCompletionTracker;

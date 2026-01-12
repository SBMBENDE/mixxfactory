/**
 * Availability Calendar Component
 * Pro-only feature for professionals to manage their availability
 */

'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faChevronLeft, faChevronRight, faSave, faLock } from '@fortawesome/free-solid-svg-icons';

interface AvailabilityCalendarProps {
  availability?: Record<string, boolean>; // { '2026-01-15': true, ... }
  onSave?: (availability: Record<string, boolean>) => Promise<void>;
  readOnly?: boolean;
  subscriptionTier?: string;
}

export default function AvailabilityCalendar({
  availability = {},
  onSave,
  readOnly = false,
  subscriptionTier = 'free',
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localAvailability, setLocalAvailability] = useState<Record<string, boolean>>(availability);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const isProUser = subscriptionTier === 'pro';
  const canEdit = !readOnly && isProUser;

  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const toggleDay = (date: Date) => {
    if (!canEdit) return;
    
    const key = formatDateKey(date);
    setLocalAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!onSave || !hasChanges) return;
    
    setSaving(true);
    try {
      await onSave(localAvailability);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save availability:', error);
    } finally {
      setSaving(false);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendar} className="text-purple-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {readOnly ? 'Availability Calendar' : 'Manage Availability'}
          </h3>
          {!isProUser && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
              Pro Only
            </span>
          )}
        </div>
        
        {canEdit && hasChanges && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSave} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <h4 className="font-medium text-gray-900 dark:text-white">
          {monthName}
        </h4>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateKey = formatDateKey(date);
          const isAvailable = localAvailability[dateKey];
          const isPast = date < today;
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={dateKey}
              onClick={() => toggleDay(date)}
              disabled={!canEdit || isPast}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${isPast ? 'opacity-30 cursor-not-allowed' : ''}
                ${isToday ? 'ring-2 ring-purple-500' : ''}
                ${isAvailable
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }
                ${canEdit && !isPast ? 'cursor-pointer' : 'cursor-default'}
                ${!canEdit ? 'opacity-70' : ''}
              `}
              title={
                isPast
                  ? 'Past date'
                  : !canEdit
                  ? 'Upgrade to Pro to manage availability'
                  : isAvailable
                  ? 'Available - Click to mark unavailable'
                  : 'Unavailable - Click to mark available'
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded" />
          <span>Unavailable</span>
        </div>
      </div>

      {/* Upgrade prompt for non-Pro users */}
      {!isProUser && !readOnly && (
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faLock} className="text-amber-600 mt-1" />
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Upgrade to Pro to Manage Availability
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                Let clients know when you&apos;re available with an interactive calendar. 
                Boost bookings by showing your open dates.
              </p>
              <a
                href="/checkout"
                className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for Pro users */}
      {canEdit && (
        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            💡 <strong>Tip:</strong> Click on future dates to toggle your availability. 
            Green = available, Gray = unavailable. Your calendar is visible on your public profile.
          </p>
        </div>
      )}
    </div>
  );
}

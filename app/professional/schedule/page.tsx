/**
 * Professional Schedule - Coming Soon Page
 * Advanced scheduling and time management preview
 */

'use client';

import Link from 'next/link';

export default function SchedulePage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">🗓️</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Schedule & Time Management
            </h1>
            <span className="inline-block mt-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-semibold">
              Coming Soon
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          We&apos;re developing an advanced scheduling system with time blocking, recurring events, 
          and automated reminders. For now, use your availability calendar to manage your time.
        </p>
      </div>

      {/* Temporary Workaround */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <span>📅</span>
          Managing Your Schedule Now
        </h2>
        
        <div className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
          <p>
            <strong>Available right now:</strong> Use your{' '}
            <Link href="/professional/calendar" className="underline font-medium hover:text-blue-600">
              availability calendar
            </Link>{' '}
            to mark days you&apos;re available. Clients can see this on your public profile.
          </p>
          <p>
            The full scheduling system will integrate with your bookings to show detailed time slots, 
            recurring appointments, and buffer times between jobs.
          </p>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>✨</span>
          What&apos;s Coming
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="text-2xl">⏰</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Time Block Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create custom time blocks for different types of appointments
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🔄</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Recurring Events</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up weekly, monthly, or custom recurring availability
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🔗</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Calendar Sync</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sync with Google Calendar, Outlook, and Apple Calendar
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">⚡</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Buffer Times</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically add prep and travel time between bookings
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🌍</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Time Zone Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Handle bookings across different time zones automatically
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">📱</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Mobile Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get reminders before appointments on your phone
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Alternative */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">✅</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
              Available Now: Basic Availability Calendar
            </h3>
            <p className="text-green-800 dark:text-green-200 mb-3">
              While we build the full scheduling system, you can mark your available and unavailable dates 
              so clients know when to book you.
            </p>
            <Link 
              href="/professional/calendar"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Manage Availability
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mock Schedule Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Schedule View Preview (Coming Soon)
        </h2>
        
        <div className="space-y-2 opacity-50">
          {/* Mock time blocks */}
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Monday, January 20, 2026
          </div>
          {[
            { time: '9:00 AM - 11:00 AM', title: 'Wedding Consultation', type: 'booking', color: 'blue' },
            { time: '11:00 AM - 12:00 PM', title: 'Travel Buffer', type: 'buffer', color: 'gray' },
            { time: '2:00 PM - 5:00 PM', title: 'Event Setup', type: 'booking', color: 'blue' },
            { time: '6:00 PM - 10:00 PM', title: 'Available', type: 'available', color: 'green' },
          ].map((block, idx) => (
            <div 
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                block.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                block.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="text-sm font-mono text-gray-600 dark:text-gray-400 w-40">
                {block.time}
              </div>
              <div className="flex-1">
                <span className={`font-medium ${
                  block.color === 'blue' ? 'text-blue-900 dark:text-blue-100' :
                  block.color === 'green' ? 'text-green-900 dark:text-green-100' :
                  'text-gray-900 dark:text-gray-100'
                }`}>
                  {block.title}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          This is a preview of what your schedule view will look like
        </div>
      </div>
    </div>
  );
}

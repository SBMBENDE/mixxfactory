/**
 * Professional Jobs - Coming Soon Page
 * Job management and booking system preview
 */

'use client';

import Link from 'next/link';

export default function JobsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">💼</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Jobs & Bookings
            </h1>
            <span className="inline-block mt-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-semibold">
              Coming Soon
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          We&apos;re building a comprehensive job management system to help you track bookings, manage 
          client projects, and streamline your workflow. Until then, continue managing bookings directly with clients.
        </p>
      </div>

      {/* Temporary Workaround */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <span>📋</span>
          Managing Bookings Now
        </h2>
        
        <div className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
          <p>
            <strong>Current options:</strong> Use your existing tools (calendar apps, spreadsheets, or booking software) 
            to manage client bookings until our integrated system launches.
          </p>
          <p>
            Make sure your <Link href="/professional/calendar" className="underline font-medium hover:text-blue-600">availability calendar</Link> is 
            up to date so clients know when you&apos;re free.
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
            <div className="text-2xl">📅</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Booking Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Accept, decline, and manage all booking requests in one place
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Deposit Collection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Secure upfront payments and deposits through the platform
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Job Pipeline</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track jobs from inquiry → booked → in progress → completed
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🔔</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Automatic Reminders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send automatic confirmations and reminders to clients
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">📝</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Digital Contracts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, send, and manage contracts with e-signatures
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">📈</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Performance Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track booking rates, revenue, and client satisfaction
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
              The job management system will be available to PRO members with unlimited bookings, 
              automated workflows, integrated payments, and priority support.
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

      {/* Mock Jobs List Preview */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Jobs Dashboard Preview (Coming Soon)
        </h2>
        
        <div className="space-y-3 opacity-50">
          {/* Mock job items */}
          {[
            { client: 'Sarah Johnson', event: 'Wedding Reception', date: 'Jan 28, 2026', status: 'Confirmed', color: 'green' },
            { client: 'Michael Chen', event: 'Corporate Event', date: 'Feb 5, 2026', status: 'Pending', color: 'yellow' },
            { client: 'Emily Rodriguez', event: 'Birthday Party', date: 'Feb 12, 2026', status: 'Inquiry', color: 'blue' },
          ].map((job, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {job.event}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    job.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    job.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {job.client} • {job.date}
                </p>
              </div>
              <button className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          This is a preview of what your jobs dashboard will look like
        </div>
      </div>
    </div>
  );
}

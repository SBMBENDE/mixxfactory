/**
 * Professional Earnings - Coming Soon Page
 * Revenue tracking and payment management preview
 */

'use client';

import Link from 'next/link';

export default function EarningsPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">💰</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Earnings & Payments
            </h1>
            <span className="inline-block mt-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-semibold">
              Coming Soon
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          We&apos;re building a comprehensive earnings dashboard with payment processing, revenue analytics, 
          and automated invoicing. Continue managing payments directly with clients for now.
        </p>
      </div>

      {/* Temporary Workaround */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <span>💳</span>
          Managing Payments Now
        </h2>
        
        <div className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
          <p>
            <strong>Current approach:</strong> Continue using your existing payment methods (bank transfer, 
            mobile money, cash, etc.) to collect payments from clients.
          </p>
          <p>
            When our payment system launches, you&apos;ll be able to accept online payments, track earnings 
            automatically, and generate invoices—all in one place.
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
            <div className="text-2xl">💳</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Online Payments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Accept credit cards, mobile money, and bank transfers seamlessly
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Revenue Dashboard</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track daily, weekly, and monthly earnings with visual charts
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🧾</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Automatic Invoicing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate and send professional invoices automatically
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🔔</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Payment Reminders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automated reminders for pending and overdue payments
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">📈</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Financial Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Export earnings reports for tax filing and bookkeeping
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-2xl">🏦</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Fast Payouts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get your earnings deposited directly to your bank account
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Badge Teaser */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
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
              PRO members will enjoy lower transaction fees (2.5% vs 5%), instant payouts, 
              advanced analytics, and unlimited invoicing when the earnings system launches.
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

      {/* Mock Earnings Dashboard Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Earnings Dashboard Preview (Coming Soon)
        </h2>
        
        <div className="opacity-50">
          {/* Mock stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">This Month</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">$4,250</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">+12% from last month</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">$1,500</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">3 unpaid invoices</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Earned</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">$28,750</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Since Jan 2026</div>
            </div>
          </div>

          {/* Mock transactions list */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Recent Transactions
            </div>
            {[
              { client: 'Sarah Johnson', amount: '$850', date: 'Jan 15', status: 'Paid', color: 'green' },
              { client: 'Michael Chen', amount: '$1,200', date: 'Jan 12', status: 'Paid', color: 'green' },
              { client: 'Emily Rodriguez', amount: '$600', date: 'Jan 10', status: 'Pending', color: 'yellow' },
              { client: 'David Kim', amount: '$950', date: 'Jan 8', status: 'Paid', color: 'green' },
            ].map((transaction, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {transaction.client}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {transaction.amount}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    transaction.color === 'green' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          This is a preview of what your earnings dashboard will look like
        </div>
      </div>
    </div>
  );
}

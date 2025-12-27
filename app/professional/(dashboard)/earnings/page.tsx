
"use client";
import { useState } from 'react';

const mockSummary = {
  total: 4200,
  thisMonth: 1200,
  pending: 300,
};

const mockTransactions = [
  { id: 't1', date: '2025-12-10', client: 'Alice Smith', amount: 500, status: 'Paid' },
  { id: 't2', date: '2025-12-20', client: 'Acme Corp', amount: 700, status: 'Paid' },
  { id: 't3', date: '2026-01-05', client: 'Bob Lee', amount: 300, status: 'Pending' },
];

export default function ProfessionalEarningsPage() {
  const [payoutSetup, setPayoutSetup] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Earnings & Payments</h1>
      <p className="text-gray-600 mb-4">See your earnings, transaction history, and manage payouts.</p>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-gray-500 text-sm mb-1">Total Earnings</div>
          <div className="text-2xl font-bold text-green-600">€{mockSummary.total}</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-gray-500 text-sm mb-1">This Month</div>
          <div className="text-2xl font-bold text-blue-600">€{mockSummary.thisMonth}</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-gray-500 text-sm mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">€{mockSummary.pending}</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded shadow p-4 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Client</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map(tx => (
              <tr key={tx.id} className="border-b">
                <td className="px-3 py-2">{tx.date}</td>
                <td className="px-3 py-2">{tx.client}</td>
                <td className="px-3 py-2 text-right">€{tx.amount}</td>
                <td className="px-3 py-2 text-center">
                  <span className={
                    tx.status === 'Paid' ? 'text-green-600 font-semibold' :
                    'text-yellow-600 font-semibold'
                  }>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payout Setup */}
      <div className="bg-white rounded shadow p-4 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Payout Setup</h2>
        {payoutSetup ? (
          <div className="text-green-700 font-medium">Payout account connected! (Mock)</div>
        ) : (
          <div>
            <div className="mb-2 text-gray-600">Connect your payout account to receive payments.</div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setPayoutSetup(true)}
            >
              Connect Payout Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Admin SOS Support Dashboard
 * View and manage urgent support requests from professionals
 */

'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLifeRing, 
  faClock, 
  faCheckCircle,
  faExclamationTriangle,
  faCrown,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

interface SOSTicket {
  _id: string;
  professionalId: string;
  professionalName: string;
  professionalEmail: string;
  subscriptionTier: 'free' | 'starter' | 'pro';
  reason: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'normal' | 'high';
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const reasonLabels: Record<string, string> = {
  'account-access': 'Account Access Issue',
  'payment-issue': 'Payment or Subscription Issue',
  'profile-blocked': 'Profile Not Visible / Blocked',
  'booking-calendar': 'Booking or Calendar Issue',
  'other-urgent': 'Other Urgent Issue',
};

export default function AdminSOSPage() {
  const [tickets, setTickets] = useState<SOSTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'in-progress' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SOSTicket | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/sos-support');
      const data = await res.json();

      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string, adminNotes?: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/sos-support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchTickets();
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    highPriority: tickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faLifeRing} className="text-3xl text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            SOS Support Tickets
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage urgent support requests from professionals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tickets</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400 mb-1">New</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.new}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 mb-1">Resolved</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">High Priority</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.highPriority}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'new', 'in-progress', 'resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {ticket.professionalName}
                    </h3>
                    {ticket.subscriptionTier === 'pro' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded text-xs font-semibold">
                        <FontAwesomeIcon icon={faCrown} className="text-xs" />
                        PRO
                      </span>
                    )}
                    {ticket.priority === 'high' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-xs font-semibold">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {ticket.professionalEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                    {formatDate(ticket.createdAt)}
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('-', ' ')}
                </span>
              </div>

              <div className="mb-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {reasonLabels[ticket.reason]}
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {ticket.message}
                </p>
              </div>

              {ticket.adminNotes && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                  <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Admin Notes
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{ticket.adminNotes}</p>
                </div>
              )}

              <div className="flex gap-2">
                {ticket.status === 'new' && (
                  <button
                    onClick={() => updateTicketStatus(ticket._id, 'in-progress')}
                    disabled={updating}
                    className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Start Working
                  </button>
                )}
                {(ticket.status === 'new' || ticket.status === 'in-progress') && (
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
                <a
                  href={`mailto:${ticket.professionalEmail}`}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Email Professional
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No {filter !== 'all' ? filter : ''} tickets found
            </p>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mark Ticket as Resolved
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add resolution notes for {selectedTicket.professionalName}
            </p>
            <textarea
              id="resolutionNotes"
              placeholder="Describe how the issue was resolved..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const notes = (document.getElementById('resolutionNotes') as HTMLTextAreaElement)?.value;
                  updateTicketStatus(selectedTicket._id, 'resolved', notes);
                }}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Resolve Ticket'}
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

export default function FeaturedAdminPage() {


  const [events, setEvents] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch all events and professionals on mount
  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/events").then(res => res.json()),
      fetch("/api/professionals").then(res => res.json())
    ])
      .then(([eventsRes, prosRes]) => {
        setEvents(eventsRes.data?.events || eventsRes.data || []);
        setProfessionals(prosRes.data?.data || prosRes.data || []);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);


  // Toggle featured status for event or professional
  const handleToggleFeatured = async (type: 'event' | 'professional', item: any) => {
    const url = type === 'event'
      ? `/api/events/${item._id}`
      : `/api/professionals/${item._id}`;
    try {
      setToast(null);
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !item.featured })
      });
      if (!res.ok) throw new Error('Failed to update featured status');
      setToast({ message: `${type === 'event' ? 'Event' : 'Professional'} ${item.featured ? 'unfeatured' : 'featured'} successfully`, type: 'success' });
      // Refresh data
      if (type === 'event') {
        setEvents(events => events.map(ev => ev._id === item._id ? { ...ev, featured: !ev.featured } : ev));
      } else {
        setProfessionals(pros => pros.map(p => p._id === item._id ? { ...p, featured: !p.featured } : p));
      }
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error updating featured status', type: 'error' });
    }
  };

  // Change priority (move up/down)
  const handleChangePriority = async (type: 'event' | 'professional', item: any, direction: 'up' | 'down') => {
    const url = type === 'event'
      ? `/api/events/${item._id}`
      : `/api/professionals/${item._id}`;
    const newPriority = (item.priority || 0) + (direction === 'up' ? 1 : -1);
    try {
      setToast(null);
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority })
      });
      if (!res.ok) throw new Error('Failed to update priority');
      setToast({ message: `Priority updated`, type: 'success' });
      if (type === 'event') {
        setEvents(events => events.map(ev => ev._id === item._id ? { ...ev, priority: newPriority } : ev));
      } else {
        setProfessionals(pros => pros.map(p => p._id === item._id ? { ...p, priority: newPriority } : p));
      }
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : 'Error updating priority', type: 'error' });
    }
  };

  return (
    <div className="p-6">
      {loading && <div className="text-center py-8 text-lg">Loading content...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && !error && (
        <>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <Button variant={typeFilter === "all" ? "primary" : "outline"} onClick={() => setTypeFilter('all')}>All</Button>
            <Button variant={typeFilter === "event" ? "primary" : "outline"} onClick={() => setTypeFilter('event')}>Events</Button>
            <Button variant={typeFilter === "professional" ? "primary" : "outline"} onClick={() => setTypeFilter('professional')}>Professionals</Button>
          </div>

          {/* Events Table */}
          {(typeFilter === 'all' || typeFilter === 'event') && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">All Events</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Title</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Start Date</th>
                      <th className="px-4 py-2">Featured</th>
                      <th className="px-4 py-2">Priority</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event._id} className={event.featured ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-gray-800'}>
                        <td className="px-4 py-2 font-medium">{event.title}</td>
                        <td className="px-4 py-2">{event.category}</td>
                        <td className="px-4 py-2">{event.startDate ? new Date(event.startDate).toLocaleDateString() : ''}</td>
                        <td className="px-4 py-2">
                          <button
                            className={`px-3 py-1 rounded text-xs font-bold ${event.featured ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                            onClick={() => handleToggleFeatured('event', event)}
                          >
                            {event.featured ? 'Featured' : 'Unfeatured'}
                          </button>
                        </td>
                        <td className="px-4 py-2 flex items-center gap-2">
                          <button
                            className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                            onClick={() => handleChangePriority('event', event, 'up')}
                          >▲</button>
                          {event.priority ?? '-'}
                          <button
                            className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                            onClick={() => handleChangePriority('event', event, 'down')}
                          >▼</button>
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => window.open(`/events/${event.slug}`, '_blank')}>Preview</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {events.length === 0 && (
                  <div className="text-gray-500 dark:text-gray-400 px-4 py-2">No events found.</div>
                )}
              </div>
            </div>
          )}

          {/* Professionals Table */}
          {(typeFilter === 'all' || typeFilter === 'professional') && (
            <div>
              <h2 className="text-2xl font-semibold mb-2 mt-6">All Professionals</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Featured</th>
                      <th className="px-4 py-2">Priority</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {professionals.map(prof => (
                      <tr key={prof._id} className={prof.featured ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-gray-800'}>
                        <td className="px-4 py-2 font-medium">{prof.name}</td>
                        <td className="px-4 py-2">{prof.category?.name || ''}</td>
                        <td className="px-4 py-2">
                          <button
                            className={`px-3 py-1 rounded text-xs font-bold ${prof.featured ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                            onClick={() => handleToggleFeatured('professional', prof)}
                          >
                            {prof.featured ? 'Featured' : 'Unfeatured'}
                          </button>
                        </td>
                        <td className="px-4 py-2 flex items-center gap-2">
                          <button
                            className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                            onClick={() => handleChangePriority('professional', prof, 'up')}
                          >▲</button>
                          {prof.priority ?? '-'}
                          <button
                            className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                            onClick={() => handleChangePriority('professional', prof, 'down')}
                          >▼</button>
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => window.open(`/professionals/${prof.slug}`, '_blank')}>Preview</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {professionals.length === 0 && (
                  <div className="text-gray-500 dark:text-gray-400 px-4 py-2">No professionals found.</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {/* Unfeature Modal removed: modalItem state no longer present */}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

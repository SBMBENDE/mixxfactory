"use client";
import { useEffect, useState } from 'react';
import { Event } from '@/types';
import { Button } from '@/components/ui/Button';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/events');
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        } else {
          setError('Failed to fetch events');
        }
      } catch (err) {
        setError('Error fetching events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Events</h1>
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">Published</th>
              <th className="px-4 py-2">Featured</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td className="px-4 py-2">{event.title}</td>
                <td className="px-4 py-2">{event.category}</td>
                <td className="px-4 py-2">{new Date(event.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{event.published ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant={event.featured ? 'success' : 'secondary'}
                    onClick={async () => {
                      const res = await fetch(`/api/events/${event._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ featured: !event.featured }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setEvents(events.map(e => e._id === event._id ? { ...e, featured: !event.featured } : e));
                      } else {
                        alert(data.error || 'Failed to update featured status');
                      }
                    }}
                  >
                    {event.featured ? 'Featured' : 'Not Featured'}
                  </Button>
                </td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      window.location.href = `/admin/events/${event._id}/edit`;
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="ml-2"
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
                        const res = await fetch(`/api/events/${event._id}`, {
                          method: 'DELETE',
                          credentials: 'include',
                        });
                        const data = await res.json();
                        if (data.success) {
                          setEvents(events.filter(e => e._id !== event._id));
                        } else {
                          alert(data.error || 'Failed to delete event');
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

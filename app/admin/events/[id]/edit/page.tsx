"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event } from '@/types';
import { Button } from '@/components/ui/Button';

export default function AdminEventEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setEvent(data.data);
        } else {
          setError(data.error || 'Event not found');
        }
      } catch (err) {
        setError('Error fetching event');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!event) return;
    const { name, value } = e.target;
    setEvent({ ...event, [name]: value });
  };

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(event),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/events');
      } else {
        setError(data.error || 'Failed to update event');
      }
    } catch (err) {
      setError('Error updating event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading event...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!event) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            name="title"
            value={event.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Category</label>
          <input
            className="w-full border rounded px-3 py-2"
            name="category"
            value={event.category}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Start Date</label>
          <input
            className="w-full border rounded px-3 py-2"
            name="startDate"
            type="date"
            value={event.startDate ? new Date(event.startDate).toISOString().slice(0,10) : ''}
            onChange={e => setEvent({ ...event, startDate: new Date(e.target.value) })}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            name="description"
            value={event.description}
            onChange={handleChange}
          />
        </div>
        {/* Add more fields as needed */}
        <div className="flex gap-4 mt-6">
          <Button onClick={handleSave} disabled={saving} variant="primary">
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={() => router.push('/admin/events')} variant="secondary">
            Cancel
          </Button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}

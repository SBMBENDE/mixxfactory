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

  const handleTicketingChange = (
    index: number,
    field: 'label' | 'price' | 'currency' | 'quantity',
    value: string
  ) => {
    if (!event) return;

    const updatedTicketing = [...(event.ticketing || [])];
    const current = updatedTicketing[index] || { label: '', price: 0, currency: 'EUR' };

    if (field === 'price') {
      current.price = Number.parseFloat(value) || 0;
    } else if (field === 'quantity') {
      if (value.trim() === '') {
        delete current.quantity;
      } else {
        current.quantity = Math.max(0, Number.parseInt(value, 10) || 0);
      }
    } else {
      current[field] = value as never;
    }

    updatedTicketing[index] = current;
    setEvent({ ...event, ticketing: updatedTicketing });
  };

  const addTicketTier = () => {
    if (!event) return;
    const updatedTicketing = [...(event.ticketing || []), { label: '', price: 0, currency: 'EUR' }];
    setEvent({ ...event, ticketing: updatedTicketing });
  };

  const removeTicketTier = (index: number) => {
    if (!event) return;
    const updatedTicketing = (event.ticketing || []).filter((_, i) => i !== index);
    setEvent({ ...event, ticketing: updatedTicketing });
  };

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    setError('');

    const cleanedTicketing = (event.ticketing || [])
      .map((tier) => ({
        label: (tier.label || '').trim(),
        price: Number(tier.price) || 0,
        currency: (tier.currency || 'EUR').trim() || 'EUR',
        quantity:
          tier.quantity === undefined || tier.quantity === null
            ? undefined
            : Math.max(0, Number(tier.quantity) || 0),
      }))
      .filter((tier) => tier.label.length > 0);

    if (cleanedTicketing.length === 0) {
      setError('Please add at least one ticket tier with a label.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...event,
          ticketing: cleanedTicketing,
        }),
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block font-medium">Ticketing</label>
            <button
              type="button"
              onClick={addTicketTier}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Ticket Tier
            </button>
          </div>

          {(event.ticketing || []).length === 0 ? (
            <div className="text-sm text-gray-500 border rounded px-3 py-2">
              No ticket tiers configured yet.
            </div>
          ) : (
            <div className="space-y-3">
              {(event.ticketing || []).map((tier, index) => (
                <div key={`${tier.label}-${index}`} className="grid grid-cols-1 md:grid-cols-5 gap-3 border rounded p-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Label</label>
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={tier.label || ''}
                      onChange={(e) => handleTicketingChange(index, 'label', e.target.value)}
                      placeholder="VIP"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Price</label>
                    <input
                      className="w-full border rounded px-2 py-1"
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.price ?? 0}
                      onChange={(e) => handleTicketingChange(index, 'price', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Currency</label>
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={tier.currency || 'EUR'}
                      onChange={(e) => handleTicketingChange(index, 'currency', e.target.value.toUpperCase())}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                    <input
                      className="w-full border rounded px-2 py-1"
                      type="number"
                      min="0"
                      value={tier.quantity ?? ''}
                      onChange={(e) => handleTicketingChange(index, 'quantity', e.target.value)}
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeTicketTier(index)}
                      className="w-full px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

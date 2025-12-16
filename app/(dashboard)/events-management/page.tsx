/**
 * Admin Events Management
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface Event {
  _id: string;
  title: string;
  category: string;
  startDate: string;
  published: boolean;
  featured: boolean;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    startTime: '19:00',
    endTime: '23:59',
    location: {
      venue: '',
      city: '',
      region: '',
      address: '',
    },
    posterImage: '',
    bannerImage: '',
    ticketing: {
      general: 0,
      vip: 0,
      ticketUrl: '',
    },
    capacity: 0,
    organizer: {
      name: '',
      email: '',
      phone: '',
      website: '',
    },
    highlights: [],
    published: false,
    featured: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events?limit=100', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof typeof formData],
          [field]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const method = selectedEvent ? 'PUT' : 'POST';
      const url = selectedEvent ? `/api/events/${selectedEvent._id}` : '/api/events';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchEvents();
        setShowForm(false);
        setSelectedEvent(null);
        setFormData({
          title: '',
          description: '',
          category: '',
          startDate: '',
          endDate: '',
          startTime: '19:00',
          endTime: '23:59',
          location: { venue: '', city: '', region: '', address: '' },
          posterImage: '',
          bannerImage: '',
          ticketing: { general: 0, vip: 0, ticketUrl: '' },
          capacity: 0,
          organizer: { name: '', email: '', phone: '', website: '' },
          highlights: [],
          published: false,
          featured: false,
        });
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this event?')) {
      try {
        await fetch(`/api/events/${id}`, { method: 'DELETE', credentials: 'include' });
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Events Management</h1>

      <button
        onClick={() => {
          setShowForm(!showForm);
          setSelectedEvent(null);
        }}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          marginBottom: '2rem',
          fontWeight: '600',
        }}
      >
        + {showForm ? 'Cancel' : 'New Event'}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', gridColumn: 'span 2' }} />
          <input type="text" name="location.venue" placeholder="Venue" value={formData.location.venue} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="text" name="location.city" placeholder="City" value={formData.location.city} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="url" name="posterImage" placeholder="Poster Image URL" value={formData.posterImage} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', gridColumn: 'span 2' }} />
          <input type="number" name="ticketing.general" placeholder="General Ticket Price" value={formData.ticketing.general} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="number" name="ticketing.vip" placeholder="VIP Ticket Price (optional)" value={formData.ticketing.vip} onChange={handleChange} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="number" name="capacity" placeholder="Capacity" value={formData.capacity} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="text" name="organizer.name" placeholder="Organizer Name" value={formData.organizer.name} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
          <input type="email" name="organizer.email" placeholder="Organizer Email" value={formData.organizer.email} onChange={handleChange} required style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />

          <div style={{ display: 'flex', gap: '1rem', gridColumn: 'span 2' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} />
              Published
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
              Featured
            </label>
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '600',
              gridColumn: 'span 2',
            }}
          >
            {selectedEvent ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      )}

      {/* Events List */}
      <div style={{
        display: 'grid',
        gap: '1rem',
      }}>
        {loading ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p>No events yet</p>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1rem',
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{event.title}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                  {event.category} • {new Date(event.startDate).toLocaleDateString()}
                  {event.featured && ' ⭐'}
                  {!event.published && ' (Draft)'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowForm(true);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

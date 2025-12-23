/**
 * Admin Events Management - Enhanced with Cloudinary image uploads
 */

'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AppImage } from '@/components/AppImage';

const EventImageUpload = dynamic(() => import('@/components/EventImageUpload'), {
  loading: () => <div className="p-4 bg-gray-200 rounded animate-pulse">Loading upload...</div>,
  ssr: false,
});

interface Event {
  _id: string;
  title: string;
  category: string;
  startDate: string;
  published: boolean;
  featured: boolean;
  posterImage?: string;
}

interface TicketTier {
  label: string;
  price: number;
  currency: string;
}

interface FormDataType {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: {
    venue: string;
    city: string;
    region: string;
    address: string;
  };
  posterImage: string;
  bannerImage: string;
  ticketing: TicketTier[];
  ticketUrl: string;
  capacity: number;
  organizer: {
    name: string;
    email: string;
    phone: string;
    website: string;
  };
  highlights: string[];
  published: boolean;
  featured: boolean;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [formData, setFormData] = useState<FormDataType>({
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
    ticketing: [
      { label: 'General', price: 0, currency: 'EUR' },
    ],
    ticketUrl: '',
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
      setFormData((prevState: any) => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [field]: value,
        },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUploaded = (url: string, type: 'poster' | 'banner') => {
    if (type === 'poster') {
      setFormData({ ...formData, posterImage: url });
    } else {
      setFormData({ ...formData, bannerImage: url });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (!formData.posterImage) {
        alert('Please upload a poster image');
        return;
      }

      const method = selectedEvent ? 'PUT' : 'POST';
      const url = selectedEvent ? `/api/events/${selectedEvent._id}` : '/api/events';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

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
          ticketing: [{ label: 'General', price: 0, currency: 'EUR' }],
          ticketUrl: '',
          capacity: 0,
          organizer: { name: '', email: '', phone: '', website: '' },
          highlights: [],
          published: false,
          featured: false,
        });
      } else {
        alert(`Error: ${data.error || 'Failed to save event'}`);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event: ' + (error as Error).message);
    }
  };

  const handleEdit = (event: any) => {
    setSelectedEvent(event);
    
    // Handle backward compatibility: convert old ticketing structure to new array format
    let ticketingData: TicketTier[] = [];
    if (Array.isArray(event.ticketing)) {
      // New format - already an array
      ticketingData = event.ticketing;
    } else if (event.ticketing && typeof event.ticketing === 'object') {
      // Old format - convert object to array
      const old = event.ticketing;
      if (old.general || old.general === 0) {
        ticketingData.push({ label: 'General', price: old.general, currency: 'EUR' });
      }
      if (old.vip || old.vip === 0) {
        ticketingData.push({ label: 'VIP', price: old.vip, currency: 'EUR' });
      }
      if (old.earlyBird && old.earlyBird.price !== undefined) {
        ticketingData.push({ label: 'Early Bird', price: old.earlyBird.price, currency: 'EUR' });
      }
    }
    
    // Ensure at least one tier
    if (ticketingData.length === 0) {
      ticketingData = [{ label: 'General', price: 0, currency: 'EUR' }];
    }
    
    setFormData({
      title: event.title || '',
      description: event.description || '',
      category: event.category || '',
      startDate: event.startDate ? event.startDate.split('T')[0] : '',
      endDate: event.endDate ? event.endDate.split('T')[0] : '',
      startTime: event.startTime || '19:00',
      endTime: event.endTime || '23:59',
      location: event.location || { venue: '', city: '', region: '', address: '' },
      posterImage: event.posterImage || '',
      bannerImage: event.bannerImage || '',
      ticketing: ticketingData,
      ticketUrl: event.ticketUrl || '',
      capacity: event.capacity || 0,
      organizer: event.organizer || { name: '', email: '', phone: '', website: '' },
      highlights: event.highlights || [],
      published: event.published || false,
      featured: event.featured || false,
    });
    setShowForm(true);
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
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">🎉 Events Management</h1>

      <button
        onClick={() => {
          setShowForm(!showForm);
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
            ticketing: [{ label: 'General', price: 0, currency: 'EUR' }],
            ticketUrl: '',
            capacity: 0,
            organizer: { name: '', email: '', phone: '', website: '' },
            highlights: [],
            published: false,
            featured: false,
          });
        }}
        className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
      >
        + {showForm ? 'Cancel' : 'New Event'}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-8 border border-gray-200 dark:border-gray-700 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="Concert Name, Festival, etc."
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                placeholder="Event details, what to expect, etc."
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category...</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Theater">Theater</option>
                <option value="Comedy">Comedy</option>
                <option value="Conferences">Conferences</option>
                <option value="Festivals">Festivals</option>
                <option value="Exhibitions">Exhibitions</option>
                <option value="Workshops">Workshops</option>
              </select>
            </div>

            {/* Venue & City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                name="location.venue"
                placeholder="Venue Name"
                value={formData.location.venue}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                name="location.city"
                placeholder="City"
                value={formData.location.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Start & End Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Start & End Times */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Poster Image Upload - CLOUDINARY */}
            <div className="md:col-span-2">
              <EventImageUpload
                onImageUploaded={handleImageUploaded}
                imageType="poster"
              />
            </div>

            {/* Banner Image Upload - CLOUDINARY */}
            <div className="md:col-span-2">
              <EventImageUpload
                onImageUploaded={handleImageUploaded}
                imageType="banner"
              />
            </div>

            {/* Pricing Tiers */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ticket Types & Pricing (EUR) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      ticketing: [
                        ...formData.ticketing,
                        { label: '', price: 0, currency: 'EUR' },
                      ],
                    });
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                >
                  + Add Tier
                </button>
              </div>

              <div className="space-y-3">
                {formData.ticketing.map((tier: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Tier label (e.g., BRONZE TABLE, SILVER, GOLD)"
                        value={tier.label}
                        onChange={(e) => {
                          const updated = [...formData.ticketing];
                          updated[idx].label = e.target.value;
                          setFormData({ ...formData, ticketing: updated });
                        }}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        placeholder="Price"
                        value={tier.price}
                        onChange={(e) => {
                          const updated = [...formData.ticketing];
                          updated[idx].price = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, ticketing: updated });
                        }}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm whitespace-nowrap">EUR</span>
                    {formData.ticketing.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            ticketing: formData.ticketing.filter((_: any, i: number) => i !== idx),
                          });
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                External Ticketing Link (optional)
              </label>
              <input
                type="url"
                name="ticketUrl"
                placeholder="https://ticketplatform.com/event"
                value={formData.ticketUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                placeholder="Number of seats"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Organizer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organizer Name *
              </label>
              <input
                type="text"
                name="organizer.name"
                placeholder="Organization or Person"
                value={formData.organizer.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Organizer Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organizer Phone *
              </label>
              <input
                type="tel"
                name="organizer.phone"
                placeholder="+1 (555) 123-4567"
                value={formData.organizer.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Publish & Featured */}
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Published (visible to public)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured (homepage)
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            {selectedEvent ? '✓ Update Event' : '+ Create Event'}
          </button>
        </form>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No events yet</p>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
            >
              <div className="flex-1">
                {event.posterImage && (
                  <AppImage
                    src={event.posterImage}
                    alt={event.title}
                    width={64}
                    height={80}
                    className="w-16 h-20 object-cover rounded mb-2"
                    priority={false}
                  />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.category} • {new Date(event.startDate).toLocaleDateString()}
                  {event.featured && ' ⭐'}
                  {!event.published && ' (Draft)'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
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

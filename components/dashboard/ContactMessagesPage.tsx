"use client";
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}


export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/contact-messages');
      if (!res.ok) throw new Error('Failed to fetch contact messages');
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selected.length === messages.length) {
      setSelected([]);
    } else {
      setSelected(messages.map(m => m._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm('Delete selected messages? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/contact-messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete');
      setSelected([]);
      fetchMessages();
    } catch (err: any) {
      alert(err.message || 'Error deleting messages');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <div className="mb-2 flex items-center gap-2">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
              disabled={selected.length === 0 || deleting}
              onClick={handleBulkDelete}
            >
              {deleting ? 'Deleting...' : `Delete Selected (${selected.length})`}
            </button>
            <span className="text-xs text-gray-500">{selected.length} selected</span>
          </div>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={selected.length === messages.length && messages.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Subject</th>
                <th className="p-2 border">Message</th>
                <th className="p-2 border">Read</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg._id} className={msg.read ? '' : 'font-semibold bg-yellow-50 dark:bg-yellow-900/20'}>
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(msg._id)}
                      onChange={() => handleSelect(msg._id)}
                      aria-label={`Select message from ${msg.name}`}
                    />
                  </td>
                  <td className="p-2 border">{msg.name}</td>
                  <td className="p-2 border">
                    <a href={`mailto:${msg.email}`} className="text-blue-600 underline">{msg.email}</a>
                  </td>
                  <td className="p-2 border">{msg.subject}</td>
                  <td className="p-2 border max-w-xs truncate" title={msg.message}>{msg.message}</td>
                  <td className="p-2 border text-center">{msg.read ? 'Yes' : 'No'}</td>
                  <td className="p-2 border">{format(new Date(msg.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

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

  useEffect(() => {
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
    fetchMessages();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
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

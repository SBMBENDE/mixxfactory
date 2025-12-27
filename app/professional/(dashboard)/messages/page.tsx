
"use client";
import { useState, useRef, useEffect } from 'react';

interface MessageThread {
  id: string;
  name: string;
  lastMessage: string;
  unread: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const mockThreads: MessageThread[] = [
  { id: '1', name: 'Alice Smith', lastMessage: 'Thanks for the update!', unread: true },
  { id: '2', name: 'Acme Corp', lastMessage: 'See you at the event.', unread: false },
  { id: '3', name: 'Admin', lastMessage: 'Your profile is verified.', unread: false },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', sender: 'Alice Smith', content: 'Hi, are you available for my wedding?', timestamp: '2025-12-01 10:00' },
    { id: 'm2', sender: 'You', content: 'Yes, I am available!', timestamp: '2025-12-01 10:05' },
    { id: 'm3', sender: 'Alice Smith', content: 'Thanks for the update!', timestamp: '2025-12-01 10:10' },
  ],
  '2': [
    { id: 'm1', sender: 'Acme Corp', content: 'Please confirm the event details.', timestamp: '2025-12-02 09:00' },
    { id: 'm2', sender: 'You', content: 'Confirmed. See you at the event.', timestamp: '2025-12-02 09:10' },
  ],
  '3': [
    { id: 'm1', sender: 'Admin', content: 'Your profile is verified.', timestamp: '2025-12-03 08:00' },
  ],
};

export default function ProfessionalMessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>(mockThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(threads[0]?.id || null);
  const [messages, setMessages] = useState<Message[]>(mockMessages[threads[0]?.id] || []);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedThreadId) {
      setMessages(mockMessages[selectedThreadId] || []);
      setThreads(ts => ts.map(t => t.id === selectedThreadId ? { ...t, unread: false } : t));
    }
  }, [selectedThreadId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !selectedThreadId) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      sender: 'You',
      content: input,
      timestamp: new Date().toLocaleString(),
    };
    setMessages(msgs => [...msgs, newMsg]);
    setInput('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Messages & Communication</h1>
      <p className="text-gray-600 mb-4">Chat with clients, receive admin messages, and share files.</p>

      <div className="flex gap-6 h-[500px]">
        {/* Inbox List */}
        <div className="w-64 bg-white rounded shadow p-2 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Inbox</h2>
          <ul>
            {threads.map(thread => (
              <li
                key={thread.id}
                className={`p-2 rounded cursor-pointer mb-1 ${selectedThreadId === thread.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{thread.name}</span>
                  {thread.unread && <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>}
                </div>
                <div className="text-xs text-gray-500 truncate">{thread.lastMessage}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white rounded shadow p-4">
          <div className="flex-1 overflow-y-auto mb-2">
            {messages.map(msg => (
              <div key={msg.id} className={`mb-3 flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-3 py-2 rounded-lg ${msg.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-xs text-right opacity-70 mt-1">{msg.timestamp}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form
            className="flex gap-2 mt-auto"
            onSubmit={e => { e.preventDefault(); handleSend(); }}
          >
            <input
              className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

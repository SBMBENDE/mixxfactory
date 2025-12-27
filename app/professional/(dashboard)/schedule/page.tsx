
"use client";
import { useState } from 'react';

const mockEvents = [
  { date: '2025-12-28', title: 'Wedding - Alice Smith' },
  { date: '2026-01-05', title: 'Birthday - Bob Lee' },
  { date: '2026-01-10', title: 'Corporate - Acme Corp' },
];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

export default function ProfessionalSchedulePage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [available, setAvailable] = useState(true);

  const days = getMonthDays(currentYear, currentMonth);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const eventsByDate = Object.fromEntries(
    mockEvents.map(e => [e.date, e.title])
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Schedule & Availability</h1>
      <p className="text-gray-600 mb-4">Manage your calendar, appointments, and availability settings.</p>

      {/* Availability Toggle */}
      <div className="mb-6 flex items-center gap-4">
        <span className="font-medium">Availability:</span>
        <button
          className={`px-4 py-2 rounded font-semibold ${available ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
          onClick={() => setAvailable(a => !a)}
        >
          {available ? 'Available for Booking' : 'Unavailable'}
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded shadow p-4 mb-6 max-w-xl">
        <div className="flex justify-between items-center mb-2">
          <button onClick={handlePrevMonth} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">&lt;</button>
          <span className="font-semibold text-lg">
            {today.toLocaleString('default', { month: 'long' , year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium mb-1">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={i} />)}
          {days.map((date, idx) => {
            const dateStr = date.toISOString().slice(0,10);
            const isToday = date.toDateString() === today.toDateString();
            const hasEvent = !!eventsByDate[dateStr];
            return (
              <div
                key={dateStr}
                className={`h-14 flex flex-col items-center justify-center rounded border cursor-pointer ${isToday ? 'border-blue-500' : 'border-gray-200'} ${hasEvent ? 'bg-yellow-100' : ''}`}
                title={eventsByDate[dateStr] || ''}
              >
                <span className={isToday ? 'font-bold text-blue-600' : ''}>{date.getDate()}</span>
                {hasEvent && <span className="text-xs text-yellow-700 mt-1">• {eventsByDate[dateStr]}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded shadow p-4 max-w-xl">
        <h2 className="text-lg font-semibold mb-2">Upcoming Appointments</h2>
        <ul>
          {mockEvents.map(ev => (
            <li key={ev.date} className="mb-2">
              <span className="font-medium">{ev.title}</span> <span className="text-gray-500">({ev.date})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { Booking, BlockedTime, Availability } from "@/types";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blocks, setBlocks] = useState<BlockedTime[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch("/api/professional/calendar", { credentials: "include" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to load calendar");
        setBookings(data.data.bookings || []);
        setBlocks(data.data.blocks || []);
        setAvailability(data.data.availability || null);
      } catch (err: any) {
        setError(err.message || "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);


  // Prepare events for FullCalendar
  const calendarEvents = useMemo(() => {
    const events: any[] = [];
    bookings.forEach(b => {
      events.push({
        id: b._id,
        title: `Booking: ${b.service}`,
        start: b.start,
        end: b.end,
        color: b.status === "confirmed" ? "#22c55e" : b.status === "pending" ? "#f59e42" : "#dc2626",
        extendedProps: { type: "booking", ...b },
      });
    });
    blocks.forEach(b => {
      events.push({
        id: b._id,
        title: b.reason ? `Blocked: ${b.reason}` : "Blocked Time",
        start: b.start,
        end: b.end,
        color: "#fbbf24",
        extendedProps: { type: "block", ...b },
      });
    });
    // Optionally, show availability as background events
    if (availability) {
      // For each day in availability.days, add a background event for the time range
      const today = new Date();
      for (let i = 0; i < 14; i++) { // show 2 weeks
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        if (availability.days.includes(d.getDay())) {
          const [startHour, startMinute] = availability.startTime.split(":").map(Number);
          const [endHour, endMinute] = availability.endTime.split(":").map(Number);
          const availStart = new Date(d);
          availStart.setHours(startHour, startMinute, 0, 0);
          const availEnd = new Date(d);
          availEnd.setHours(endHour, endMinute, 0, 0);
          events.push({
            id: `avail-${d.toISOString().slice(0,10)}`,
            title: "Available",
            start: availStart,
            end: availEnd,
            display: "background",
            color: "#d1fae5",
            extendedProps: { type: "availability" },
          });
        }
      }
    }
    return events;
  }, [bookings, blocks, availability]);

  if (loading) return <div style={{ padding: 32 }}>Loading calendar...</div>;
  if (error) return <div style={{ color: "#dc2626", padding: 32 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>My Calendar</h1>
      <div style={{ marginBottom: 24 }}>
        <Link href="/professional/calendar/availability" style={{ color: "#2563eb", fontWeight: 500, marginRight: 16 }}>Set Availability</Link>
        <Link href="/professional/calendar/block" style={{ color: "#2563eb", fontWeight: 500 }}>Block Time</Link>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 8, marginBottom: 32 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          height={600}
          events={calendarEvents}
          nowIndicator
          selectable
          eventClick={(info) => {
            // Optionally, show modal or details for event
            const { type } = info.event.extendedProps;
            if (type === "booking") {
              alert(`Booking: ${info.event.title}\nStatus: ${info.event.extendedProps.status}`);
            } else if (type === "block") {
              alert(`Blocked: ${info.event.title}`);
            }
          }}
          eventBackgroundColor="#2563eb"
          eventDisplay="auto"
        />
      </div>
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>Availability Summary</h2>
        {availability ? (
          <div>
            <strong>Days:</strong> {availability.days.map(d => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]).join(", ")}<br />
            <strong>Time:</strong> {availability.startTime} - {availability.endTime}<br />
            <strong>Buffer:</strong> {availability.bufferMinutes} min
          </div>
        ) : <p>No availability set.</p>}
      </section>
    </div>
  );
}

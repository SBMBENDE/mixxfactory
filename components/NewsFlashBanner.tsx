'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NewsFlash {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  published: boolean;
  startDate: string;
  endDate: string;
  priority: number;
  link?: string; // Optional redirect link
}

const typeStyles = {
  info: { bg: '#dbeafe', text: '#1e40af', icon: 'ℹ️' },
  success: { bg: '#dcfce7', text: '#166534', icon: '✓' },
  warning: { bg: '#fef3c7', text: '#92400e', icon: '⚠️' },
  error: { bg: '#fee2e2', text: '#991b1b', icon: '✕' },
};

export default function NewsFlashBanner() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<NewsFlash[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/news-flashes');
        const data = await response.json();
        // API returns the array directly as data, or wrapped in data property
        const announcements = Array.isArray(data) ? data : (data.data || data.announcements || []);
        if (announcements && announcements.length > 0) {
          console.log('Fetched announcements:', announcements);
          setAnnouncements(announcements);
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Auto-rotate announcements every 5 seconds if there are multiple
    const interval = announcements.length > 1 ? setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [announcements.length]);

  if (loading || announcements.length === 0) {
    return null;
  }

  const current = announcements[currentIndex];
  const style = typeStyles[current.type] || typeStyles.info;

  const handleClick = () => {
    if (current.link) {
      console.log('Clicking news flash with link:', current.link);
      // Check if link is internal or external
      if (current.link.startsWith('/')) {
        // Internal link - use router
        router.push(current.link);
      } else if (current.link.startsWith('http')) {
        // External link - open in new tab
        window.open(current.link, '_blank');
      }
    }
  };

  return (
    <div
      style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: '1rem',
        margin: '1rem 0',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: current.link ? 'pointer' : 'default',
        opacity: current.link && isHovering ? 0.9 : 1,
        transition: 'opacity 0.2s ease-in-out',
      }}
      onClick={handleClick}
      onMouseEnter={() => {
        if (current.link) {
          console.log('Hovering over clickable news flash');
          setIsHovering(true);
        }
      }}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Icon */}
      <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{style.icon}</div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontWeight: '600', marginBottom: '0.25rem', margin: 0 }}>{current.title}</h3>
        <p style={{ marginBottom: 0, margin: 0, fontSize: '0.875rem' }}>
          {current.message}
          {current.link && <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>→</span>}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the main div's click
          setAnnouncements((prev) => prev.filter((_, i) => i !== currentIndex));
          if (currentIndex >= announcements.length - 1) {
            setCurrentIndex(0);
          }
        }}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: style.text,
          cursor: 'pointer',
          fontSize: '1.5rem',
          flexShrink: 0,
          opacity: 0.7,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        ✕
      </button>

      {/* Navigation */}
      {announcements.length > 1 && (
        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: i === currentIndex ? style.text : `${style.text}4d`,
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={`Announcement ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

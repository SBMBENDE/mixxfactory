/**
 * Animated Carousel Component for Category Cards
 */

'use client';

import { useState, useEffect } from 'react';

interface CarouselItem {
  nameKey: string;
  slug: string;
  emoji: string;
}

interface CarouselProps {
  items: CarouselItem[];
  renderItem: (item: CarouselItem, isVisible: boolean) => React.ReactNode;
  itemsPerView?: number;
  autoScroll?: boolean;
  autoScrollInterval?: number;
}

export default function Carousel({
  items,
  renderItem,
  itemsPerView = 4,
  autoScroll = true,
  autoScrollInterval = 4000,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll);

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [isAutoScrolling, items.length, autoScrollInterval]);

  const handlePrev = () => {
    setIsAutoScrolling(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setIsAutoScrolling(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  // Resume auto-scroll after 10 seconds of inactivity
  useEffect(() => {
    if (!autoScroll || isAutoScrolling) return;

    const timeout = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isAutoScrolling, autoScroll]);

  const visibleItems = [];
  for (let i = 0; i < itemsPerView; i++) {
    visibleItems.push(items[(currentIndex + i) % items.length]);
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
    }}>
      {/* Carousel Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
        gap: '1.5rem',
        overflow: 'hidden',
      }}>
        {visibleItems.map((item, idx) => (
          <div
            key={`${item.slug}-${idx}`}
            style={{
              animation: `slideIn 0.5s ease-out ${idx * 0.1}s both`,
              opacity: idx === 0 ? 1 : 0.8,
              transform: idx === 0 ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.3s ease',
            }}
          >
            {renderItem(item, idx === 0)}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        style={{
          position: 'absolute',
          left: '-3rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          fontSize: '1.25rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1d4ed8';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
        aria-label="Previous"
      >
        ←
      </button>

      <button
        onClick={handleNext}
        style={{
          position: 'absolute',
          right: '-3rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          fontSize: '1.25rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1d4ed8';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
        aria-label="Next"
      >
        →
      </button>

      {/* Carousel Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '2rem',
      }}>
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsAutoScrolling(false);
            }}
            style={{
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '50%',
              backgroundColor: idx === currentIndex % items.length ? '#2563eb' : '#d1d5db',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              if (idx !== currentIndex % items.length) {
                e.currentTarget.style.backgroundColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (idx !== currentIndex % items.length) {
                e.currentTarget.style.backgroundColor = '#d1d5db';
              }
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .carousel-button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

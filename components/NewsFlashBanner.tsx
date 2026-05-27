/**
 * News Flash Banner - Fixed Height, No Layout Shift
 * 
 * Mobile UX Improvements:
 * - Fixed 64px height on mobile (no layout shift)
 * - Text truncation with line-clamp
 * - Modal for full content viewing
 * - Body scroll lock when modal open
 * - Accessible focus trap with ESC support
 * 
 * Performance:
 * - GPU-accelerated animations
 * - No vertical reflow on content change
 * - Smooth transitions
 */

'use client';

import { useState, useEffect, useRef } from 'react';
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

// CSS animations with fixed height
const animationStyles = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; }
    10%, 90% { opacity: 1; }
  }

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Fixed height container - no layout shift */
  .news-flash-banner {
    min-height: 64px;
    max-height: 64px;
    overflow: hidden;
  }

  /* Desktop can be taller */
  @media (min-width: 768px) {
    .news-flash-banner {
      min-height: auto;
      max-height: none;
    }
  }

  /* Text truncation on mobile */
  @media (max-width: 767px) {
    .news-flash-title {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .news-flash-message {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  /* Modal backdrop */
  .news-flash-modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    animation: fadeInOut 0.3s ease-out;
  }

  /* Modal container */
  .news-flash-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    animation: modalFadeIn 0.3s ease-out;
  }

  @media (min-width: 768px) {
    .news-flash-modal {
      max-width: 600px;
    }
  }
`;

export default function NewsFlashBanner() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<NewsFlash[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Inject animation styles
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);

    return () => {
      styleElement.remove();
    };
  }, []);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (!showModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    // Focus trap: focus close button when modal opens
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showModal]);

  // ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Add cache-busting timestamp to force fresh data
        const response = await fetch(`/api/news-flashes?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // API returns wrapped in { success, data, message }
        let announcements: NewsFlash[] = [];
        if (data.success && data.data) {
          announcements = Array.isArray(data.data) ? data.data : [];
        } else if (Array.isArray(data)) {
          announcements = data;
        }
        
        console.log('Parsed announcements:', announcements);
        
        if (announcements && announcements.length > 0) {
          console.log('Setting announcements:', announcements);
          setAnnouncements(announcements);
        } else {
          console.log('No announcements found');
          setAnnouncements([]);
        }
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchAnnouncements();

    // Poll for updates every 30 seconds for instant admin changes
    const pollInterval = setInterval(fetchAnnouncements, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [announcements.length]);

  useEffect(() => {
    // Pause auto-slide while user is interacting (hover) or reading in modal.
    if (announcements.length <= 1 || isHovering || showModal) {
      return;
    }

    const rotateInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => {
      clearInterval(rotateInterval);
    };
  }, [announcements.length, isHovering, showModal]);

  if (loading) {
    return null;
  }

  if (announcements.length === 0) {
    console.log('No announcements to display');
    return null;
  }

  const current = announcements[currentIndex];
  if (!current) {
    console.error('Current announcement is null or undefined');
    return null;
  }
  
  const style = typeStyles[current.type] || typeStyles.info;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnnouncements((prev) => prev.filter((_, i) => i !== currentIndex));
    if (currentIndex >= announcements.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleBannerClick = () => {
    // On mobile, always open modal to show full content
    if (window.innerWidth < 768) {
      setShowModal(true);
      return;
    }

    // On desktop, follow link if available, otherwise open modal
    if (current.link) {
      if (current.link.startsWith('/')) {
        router.push(current.link);
      } else if (current.link.startsWith('http')) {
        window.open(current.link, '_blank');
      }
    } else {
      setShowModal(true);
    }
  };

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  const handleModalLinkClick = () => {
    if (current.link) {
      setShowModal(false);
      if (current.link.startsWith('/')) {
        router.push(current.link);
      } else if (current.link.startsWith('http')) {
        window.open(current.link, '_blank');
      }
    }
  };

  return (
    <>
      {/* Fixed-height banner */}
      <div
        className="news-flash-banner"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          padding: '0.75rem 1rem',
          margin: '1rem 0',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          opacity: isHovering ? 0.9 : 1,
          transition: 'opacity 0.2s ease-in-out',
          position: 'relative',
        }}
        onClick={handleBannerClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBannerClick();
          }
        }}
        aria-label="News flash announcement. Click to read more."
      >
        {/* Icon */}
        <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>{style.icon}</div>

        {/* Content - truncated on mobile */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="news-flash-title" style={{ 
            fontWeight: '600', 
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: '1.3',
          }}>
            {current.title}
          </h3>
          <p className="news-flash-message" style={{ 
            margin: 0, 
            fontSize: '0.75rem',
            lineHeight: '1.4',
            opacity: 0.9,
          }}>
            {current.message}
          </p>
        </div>

        {/* Read more indicator (mobile only) */}
        <div style={{ 
          flexShrink: 0,
          fontSize: '0.75rem',
          opacity: 0.7,
          display: window.innerWidth < 768 ? 'block' : 'none',
        }}>
          ···
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: style.text,
            cursor: 'pointer',
            fontSize: '1.25rem',
            flexShrink: 0,
            opacity: 0.7,
            transition: 'opacity 0.2s',
            padding: '0.25rem',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          aria-label="Close announcement"
        >
          ✕
        </button>

        {/* Navigation dots */}
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
                  width: '6px',
                  height: '6px',
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

      {/* Modal for full content */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="news-flash-modal-backdrop"
            onClick={handleModalBackdropClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="news-flash-modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div style={{ padding: '1.5rem' }}>
              {/* Modal Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                  <h3 
                    id="modal-title"
                    style={{ 
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      margin: 0,
                      color: style.text,
                    }}
                  >
                    {current.title}
                  </h3>
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={() => setShowModal(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0.25rem',
                    lineHeight: 1,
                  }}
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ 
                color: '#374151',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
              }}>
                {current.message}
              </div>

              {/* Modal Footer with link */}
              {current.link && (
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  <button
                    onClick={handleModalLinkClick}
                    style={{
                      backgroundColor: style.bg,
                      color: style.text,
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Learn More →
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

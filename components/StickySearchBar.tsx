'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface SearchSuggestion {
  type: 'professional' | 'event';
  title: string;
  link: string;
}

export const StickySearchBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Show sticky search after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch suggestions when search is focused or has input
  const handleSearchFocus = async () => {
    setShowSuggestions(true);
    if (searchQuery.trim().length === 0) {
      // Show popular searches when empty
      setSuggestions([
        { type: 'professional', title: 'Browse All Professionals', link: '/directory' },
        { type: 'event', title: 'View All Events', link: '/events' },
      ]);
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      // Fetch suggestions from API
      try {
        const response = await fetch(`/api/professionals?search=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        
        const suggestions: SearchSuggestion[] = [];
        
        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((prof: any) => {
            suggestions.push({
              type: 'professional',
              title: prof.name,
              link: `/professionals/${prof.slug}`,
            });
          });
        }

        setSuggestions(suggestions.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    } else {
      handleSearchFocus();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/directory?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Sticky Search Bar */}
      <div style={{
        position: 'fixed',
        top: '70px',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 40,
        padding: '1rem',
        animation: 'slideDown 0.3s ease-out',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <FontAwesomeIcon
                  icon={faSearch}
                  style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '0.875rem',
                  }}
                />
                <input
                  type="text"
                  placeholder="🔍 Search professionals or events"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    handleSearchFocus();
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderTop: 'none',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    zIndex: 50,
                    marginTop: '-1px',
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <Link
                        key={index}
                        href={suggestion.link}
                        style={{
                          display: 'block',
                          padding: '0.75rem 1rem',
                          borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                          textDecoration: 'none',
                          color: '#374151',
                          transition: 'background-color 0.2s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                          {suggestion.type === 'professional' ? '👤 ' : '🎉 '}
                          {suggestion.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

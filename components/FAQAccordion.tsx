'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items, title }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
      {title && (
        <h2 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          marginBottom: '3rem',
          textAlign: 'center',
          color: '#111827',
        }}>
          {title}
        </h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Question Button */}
            <button
              onClick={() => toggleAccordion(index)}
              style={{
                width: '100%',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: openIndex === index ? '#eff6ff' : '#f9fafb',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (openIndex !== index) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (openIndex !== index) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
            >
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
                flex: 1,
                paddingRight: '1rem',
              }}>
                {item.question}
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                minWidth: '24px',
              }}>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  color="#2563eb"
                  style={{
                    transition: 'transform 0.3s ease',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    fontSize: '1.25rem',
                  }}
                />
              </div>
            </button>

            {/* Answer */}
            {openIndex === index && (
              <div style={{
                padding: '0 1.5rem 1.5rem 1.5rem',
                borderTop: '1px solid #e5e7eb',
                animation: 'slideDown 0.3s ease',
              }}>
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6',
                  margin: 0,
                  fontSize: '1rem',
                }}>
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Animation styles */}
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
    </div>
  );
};

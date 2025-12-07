/**
 * Contact Page
 * Contact form and company information
 */

'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapPin, faClock, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from '@/hooks/useTranslations';

export default function ContactPage() {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const contactInfo = [
    {
      icon: faPhone,
      title: t.contact.phone,
      value: '+1 (555) 123-4567',
      color: '#2563eb',
    },
    {
      icon: faEnvelope,
      title: t.contact.email,
      value: 'support@mixxfactory.com',
      color: '#7c3aed',
    },
    {
      icon: faMapPin,
      title: t.contact.address,
      value: 'New York, NY 10001, USA',
      color: '#06b6d4',
    },
    {
      icon: faClock,
      title: t.contact.hours,
      value: t.contact.available24_7,
      color: '#10b981',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessage = data.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join(', ');
          setError(errorMessage);
        } else {
          setError(data.message || 'Failed to submit message. Please try again.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError('An error occurred. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #7c3aed 100%)',
        color: 'white',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {t.contact.title}
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.95 }}>
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {contactInfo.map((info, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ fontSize: '2.5rem', color: info.color, marginBottom: '1rem' }}>
                <FontAwesomeIcon icon={info.icon} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                {info.title}
              </h3>
              <p style={{ fontSize: '1rem', color: '#6b7280' }}>{info.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Contact Section */}
      <section style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Contact Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
              {t.contact.sendMessage}
            </h2>

            {success && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#d1fae5',
                color: '#047857',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontWeight: '600',
              }}>
                ✓ {t.contact.successMessage}
              </div>
            )}

            {error && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  {t.contact.name}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  {t.contact.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  {t.contact.subject}
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help?"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  {t.contact.message}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us more..."
                  required
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faPaperPlane} />
                  {loading ? t.contact.sending : t.contact.send}
                </span>
              </button>
            </form>
          </div>

          {/* Map and Additional Info */}
          <div>
            {/* Google Map */}
            <div style={{
              borderRadius: '1rem',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '2rem',
              height: '400px',
              backgroundColor: '#e5e7eb',
            }}>
              <iframe
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                loading="lazy"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00601592346847!3d40.71455697130642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a317fd26eb1%3A0x55194ec4e5b63d07!2s10001%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1701800000000"
                allowFullScreen={true}
                aria-hidden="false"
                tabIndex={0}
              ></iframe>
            </div>

            {/* Business Hours */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                {t.contact.businessHours}
              </h3>
              <div>
                {[
                  { day: t.contact.monday, hours: '9:00 AM - 6:00 PM' },
                  { day: t.contact.saturday, hours: '10:00 AM - 4:00 PM' },
                  { day: t.contact.sunday, hours: 'Closed' },
                  { day: t.contact.support24, hours: '24/7 Available' },
                ].map((schedule, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: index < 3 ? '1px solid #e5e7eb' : 'none' }}>
                    <span style={{ fontWeight: '500', color: '#374151' }}>{schedule.day}</span>
                    <span style={{ color: '#6b7280' }}>{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '4rem 1rem', backgroundColor: 'white', marginTop: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center', color: '#111827' }}>
            {t.contact.faq}
          </h2>
          <div>
            {[
              {
                question: t.contact.faqQ1,
                answer: t.contact.faqA1,
              },
              {
                question: t.contact.faqQ2,
                answer: t.contact.faqA2,
              },
              {
                question: t.contact.faqQ3,
                answer: t.contact.faqA3,
              },
              {
                question: t.contact.faqQ4,
                answer: t.contact.faqA4,
              },
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  borderLeft: '4px solid #2563eb',
                }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                  {faq.question}
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

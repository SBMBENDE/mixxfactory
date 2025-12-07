/**
 * About Page
 * Company information, mission, and team
 */

'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faFire, faStar, faGlobeAmericas, faCheck, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from '@/hooks/useTranslations';

export default function AboutPage() {
  const t = useTranslations();
  const stats = [
    { icon: faUsers, label: t.about.professionals, value: '500+' },
    { icon: faFire, label: t.about.categories, value: '20+' },
    { icon: faStar, label: t.about.reviews, value: '2.5K+' },
    { icon: faGlobeAmericas, label: t.about.countries, value: '15+' },
  ];

  const values = [
    {
      icon: faStar,
      title: t.about.excellence,
      description: t.about.excellenceDesc,
    },
    {
      icon: faShieldAlt,
      title: t.about.trust,
      description: t.about.trustDesc,
    },
    {
      icon: faCheck,
      title: t.about.reliability,
      description: t.about.reliabilityDesc,
    },
  ];

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
            {t.about.title}
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.95, marginBottom: '2rem' }}>
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
              {t.about.mission}
            </h2>
            <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: '#374151', marginBottom: '1rem' }}>
              {t.about.missionText}
            </p>
            <p style={{ fontSize: '1.125rem', lineHeight: '1.8', color: '#374151' }}>
              {t.about.missionText2}
            </p>
          </div>
          <div style={{
            backgroundColor: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            borderRadius: '1.5rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '280px',
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎯</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{t.about.missionCard}</h3>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center', color: '#111827' }}>
            {t.about.byNumbers}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  borderRadius: '1rem',
                  backgroundColor: '#f3f4f6',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2rem', color: '#2563eb', marginBottom: '1rem' }}>
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '1rem', color: '#6b7280' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '3rem', textAlign: 'center', color: '#111827' }}>
          {t.about.values}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {values.map((value, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                border: '2px solid transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ fontSize: '2.5rem', color: '#2563eb', marginBottom: '1rem' }}>
                <FontAwesomeIcon icon={value.icon} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                {value.title}
              </h3>
              <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: '1.6' }}>
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: 'white',
        padding: '4rem 1rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {t.about.cta}
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.95 }}>
            {t.about.ctaDesc}
          </p>
          <a href="/directory">
            <button style={{
              padding: '0.875rem 2rem',
              backgroundColor: 'white',
              color: '#2563eb',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              {t.about.browseDir}
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}

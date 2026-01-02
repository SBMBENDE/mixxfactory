"use client";
import { useTranslations } from '@/hooks/useTranslations';

export default function TrustedByThousandsSection() {
  const t = useTranslations();
  return (
    <section style={{
      padding: '4rem 1rem',
      backgroundColor: '#ffffff',
      textAlign: 'center',
    }}>
      <h2 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '3rem',
        color: '#1f2937',
      }}>
        {t.home?.trustedByThousands || 'Trusted by Thousands'}
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div>
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '0.5rem',
          }}>
            500+
          </h3>
          <p style={{ color: '#6b7280' }}>{t.home?.activeProfessionals || 'Active Professionals'}</p>
        </div>
        <div>
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '0.5rem',
          }}>
            10K+
          </h3>
          <p style={{ color: '#6b7280' }}>{t.home?.happyClients || 'Happy Clients'}</p>
        </div>
        <div>
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2563eb',
            marginBottom: '0.5rem',
          }}>
            50+
          </h3>
          <p style={{ color: '#6b7280' }}>{t.home?.serviceCategories || 'Service Categories'}</p>
        </div>
      </div>
    </section>
  );
}

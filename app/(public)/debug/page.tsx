'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allProfessionals, setAllProfessionals] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all categories and all professionals on load
    const fetchAllData = async () => {
      try {
        const [catsRes, profsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/professionals?limit=100'),
        ]);

        const catsData = await catsRes.json();
        const profsData = await profsRes.json();

        console.log('Categories from API:', catsData);
        console.log('Professionals from API:', profsData);

        setCategories(catsData.data || []);
        const profs = Array.isArray(profsData.data) ? profsData.data : profsData.data?.data || [];
        setAllProfessionals(profs);

        if (catsData.data && catsData.data.length > 0) {
          setSelectedCat(catsData.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      }
    };
    fetchAllData();
  }, []);

  const handleCategorySelect = async (catId: string, catSlug: string) => {
    setLoading(true);
    try {
      console.log(`\n🔍 Filtering by category slug: "${catSlug}"`);
      const res = await fetch(`/api/professionals?category=${catSlug}`);
      const data = await res.json();
      
      console.log('API Response for filtered category:', {
        url: `/api/professionals?category=${catSlug}`,
        response: data,
      });
      
      const profs = Array.isArray(data.data) ? data.data : data.data?.data || [];
      setProfessionals(profs);
    } catch (err) {
      console.error('Failed to fetch professionals:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1>🐛 Debug: Database & API Analysis</h1>

      <section style={{ marginBottom: '3rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>📊 Data Overview</h2>
        <p>Total Categories: <strong>{categories.length}</strong></p>
        <p>Total Professionals (all): <strong>{allProfessionals.length}</strong></p>
      </section>

      <section style={{ marginBottom: '3rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>🗂️ All Categories</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#ddd' }}>
              <th style={{ border: '1px solid #999', padding: '0.5rem' }}>Name</th>
              <th style={{ border: '1px solid #999', padding: '0.5rem' }}>Slug</th>
              <th style={{ border: '1px solid #999', padding: '0.5rem' }}>ID</th>
              <th style={{ border: '1px solid #999', padding: '0.5rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} style={{ backgroundColor: selectedCat === cat._id ? '#ffffcc' : 'white' }}>
                <td style={{ border: '1px solid #999', padding: '0.5rem' }}>{cat.name}</td>
                <td style={{ border: '1px solid #999', padding: '0.5rem' }}>
                  <code>{cat.slug}</code>
                </td>
                <td style={{ border: '1px solid #999', padding: '0.5rem', fontSize: '0.8rem' }}>
                  <code>{cat._id}</code>
                </td>
                <td style={{ border: '1px solid #999', padding: '0.5rem' }}>
                  <button
                    onClick={() => handleCategorySelect(cat._id, cat.slug)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Filter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: '3rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>👥 All Professionals (without filter)</h2>
        <p>Count: {allProfessionals.length}</p>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
          {allProfessionals.length === 0 ? (
            <p>No professionals found</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {allProfessionals.map((prof) => (
                <li key={prof._id} style={{ marginBottom: '0.5rem' }}>
                  <strong>{prof.name}</strong> - Category ID: <code>{prof.category?._id || prof.category || 'NULL'}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>🔍 Filtered Professionals</h2>
        {loading && <p>Loading...</p>}
        {!loading && professionals.length === 0 && <p>❌ No professionals found with selected category filter</p>}
        {!loading && professionals.length > 0 && (
          <div>
            <p>✅ Found {professionals.length} professionals:</p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              {professionals.map((prof) => (
                <li key={prof._id}>
                  <strong>{prof.name}</strong> - Category: {prof.category?.name || 'Unknown'} (ID: <code>{prof.category?._id || 'NULL'}</code>)
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

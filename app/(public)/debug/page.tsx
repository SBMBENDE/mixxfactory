'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all categories
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedCat(data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleCategorySelect = async (catId: string, catSlug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/professionals?category=${catSlug}`);
      const data = await res.json();
      console.log('API Response:', data);
      setProfessionals(data.data || []);
    } catch (err) {
      console.error('Failed to fetch professionals:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Debug: Category & Professional Linking</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => handleCategorySelect(cat._id, cat.slug)}
              style={{
                padding: '1rem',
                border: selectedCat === cat._id ? '2px solid blue' : '1px solid #ccc',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: selectedCat === cat._id ? '#e0e7ff' : 'white',
              }}
            >
              <p style={{ fontWeight: 'bold' }}>{cat.name}</p>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>ID: {cat._id}</p>
              <p style={{ fontSize: '0.875rem', color: '#666' }}>Slug: {cat.slug}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Professionals in Selected Category</h2>
        {loading && <p>Loading...</p>}
        {!loading && professionals.length === 0 && <p>No professionals found</p>}
        {!loading && professionals.length > 0 && (
          <div>
            <p style={{ fontWeight: 'bold' }}>Found {professionals.length} professionals:</p>
            <ul>
              {professionals.map((prof) => (
                <li key={prof._id}>
                  {prof.name} - {prof.category?.name || 'Unknown Category'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

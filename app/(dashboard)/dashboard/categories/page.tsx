/**
 * Get admin categories page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        setError(data.message || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCategories(categories.filter((c) => c._id !== id));
        alert('Category deleted successfully');
      } else {
        const data = await response.json();
        alert(`Error: ${data.message || 'Failed to delete'}`);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Error deleting category');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading categories...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Categories</h1>
        <Link href="/dashboard/categories/new">
          <Button>+ Add Category</Button>
        </Link>
      </div>

      {error && (
        <Card style={{ marginBottom: '1.5rem', borderLeft: '4px solid #ef4444' }}>
          <CardBody>
            <p style={{ color: '#dc2626' }}>{error}</p>
          </CardBody>
        </Card>
      )}

      {categories.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No categories yet</p>
            <Link href="/dashboard/categories/new">
              <Button>Create First Category</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {categories.map((cat) => (
            <Card key={cat._id}>
              <CardBody style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{cat.name}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {cat.slug} {cat.icon && `• ${cat.icon}`}
                  </p>
                  {cat.description && (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>{cat.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <Link href={`/dashboard/categories/${cat._id}`}>
                    <Button style={{ width: '100%' }} variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    style={{ width: '100%', color: '#dc2626' }}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cat._id, cat.name)}
                  >
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

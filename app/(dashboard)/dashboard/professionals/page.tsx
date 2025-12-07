/**
 * Admin Professionals Management Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/professionals?page=${page}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setProfessionals(data.data.data || []);
        setTotalPages(data.data.totalPages || 1);
        setError('');
      } else {
        setError(data.message || 'Failed to load professionals');
        setProfessionals([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading professionals');
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/admin/professionals/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setProfessionals(professionals.filter((p) => p._id !== id));
        alert('Professional deleted successfully');
      } else {
        const data = await response.json();
        alert(`Error: ${data.message || 'Failed to delete'}`);
      }
    } catch (error) {
      console.error('Error deleting professional:', error);
      alert('Error deleting professional');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/professionals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
        credentials: 'include',
      });

      if (response.ok) {
        setProfessionals(
          professionals.map((p) =>
            p._id === id ? { ...p, active: !currentStatus } : p
          )
        );
      } else {
        alert('Failed to update professional status');
      }
    } catch (error) {
      console.error('Error updating professional:', error);
      alert('Error updating professional');
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/professionals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured }),
        credentials: 'include',
      });

      if (response.ok) {
        setProfessionals(
          professionals.map((p) =>
            p._id === id ? { ...p, featured: !currentFeatured } : p
          )
        );
      } else {
        alert('Failed to update professional featured status');
      }
    } catch (error) {
      console.error('Error updating professional:', error);
      alert('Error updating professional');
    }
  };

  const handleSetRating = async (id: string) => {
    const rating = prompt('Enter rating (1-5 stars):', '5');
    if (rating === null) return;

    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      alert('Please enter a number between 1 and 5');
      return;
    }

    try {
      const response = await fetch(`/api/admin/professionals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: numRating }),
        credentials: 'include',
      });

      if (response.ok) {
        setProfessionals(
          professionals.map((p) =>
            p._id === id ? { ...p, rating: numRating } : p
          )
        );
        alert(`Rating updated to ${numRating} stars`);
      } else {
        alert('Failed to update rating');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      alert('Error updating rating');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#6b7280' }}>
        Loading professionals...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Professionals</h1>
        <Link href="/dashboard/professionals/new">
          <Button>Add Professional</Button>
        </Link>
      </div>

      {error && (
        <Card style={{ marginBottom: '1.5rem', borderLeft: '4px solid #ef4444' }}>
          <CardBody>
            <p style={{ color: '#dc2626' }}>{error}</p>
          </CardBody>
        </Card>
      )}

      {professionals.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No professionals yet</p>
            <Link href="/dashboard/professionals/new">
              <Button>Create First Professional</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            {professionals.map((prof) => (
              <Card key={prof._id}>
                <CardBody style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {prof.name}
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {prof.category?.name || 'No category'}
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {prof.email && `📧 ${prof.email}`}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                      <span style={{ color: prof.active ? '#10b981' : '#ef4444' }}>
                        {prof.active ? '✓ Active' : '✗ Inactive'}
                      </span>
                      <span style={{ color: prof.featured ? '#f59e0b' : '#9ca3af' }}>
                        {prof.featured ? '⭐ Featured' : '☆ Not Featured'}
                      </span>
                      <span style={{ color: '#2563eb' }}>
                        {'⭐'.repeat(Math.round(prof.rating || 0))} {prof.rating ? `${prof.rating}` : 'No rating'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <Link href={`/dashboard/professionals/${prof._id}`}>
                      <Button style={{ width: '100%' }} variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(prof._id, prof.active)}
                      style={{ width: '100%' }}
                    >
                      {prof.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFeatured(prof._id, prof.featured)}
                      style={{ width: '100%', color: prof.featured ? '#f59e0b' : '#6b7280' }}
                    >
                      {prof.featured ? '★ Unmark Featured' : '☆ Mark Featured'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetRating(prof._id)}
                      style={{ width: '100%', color: '#2563eb' }}
                    >
                      ⭐ Set Rating
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prof._id, prof.name)}
                      style={{ width: '100%', color: '#dc2626' }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span style={{ color: '#6b7280' }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

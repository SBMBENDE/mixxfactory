/**
 * Admin Users Management Page
 */

'use client';

import { useEffect, useState } from 'react';

interface User {
  _id: string;
  email: string;
  accountType: 'user' | 'professional' | 'admin';
  emailVerified: boolean;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/admin/users?page=${page}&limit=20`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data.users);
      setPagination(data.data.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh list
      await fetchUsers(currentPage);
      alert('User deleted successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
      console.error('Delete user error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
          👥 User Management
        </h1>
        <p style={{ color: '#6b7280' }}>
          Total Users: <strong>{pagination?.total || 0}</strong>
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {loading && !users.length ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          No users found
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Email
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Account Type
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Verified
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Created
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: deleting === user._id ? '#fef3c7' : 'white',
                    }}
                  >
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1f2937' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor:
                            user.accountType === 'admin'
                              ? '#dbeafe'
                              : user.accountType === 'professional'
                              ? '#dcfce7'
                              : '#f3f4f6',
                          color:
                            user.accountType === 'admin'
                              ? '#1e40af'
                              : user.accountType === 'professional'
                              ? '#166534'
                              : '#374151',
                        }}
                      >
                        {user.accountType}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#1f2937' }}>
                      {user.emailVerified ? '✓ Yes' : '✗ No'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(user._id, user.email)}
                        disabled={deleting === user._id}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: deleting === user._id ? 'not-allowed' : 'pointer',
                          opacity: deleting === user._id ? 0.6 : 1,
                        }}
                      >
                        {deleting === user._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => fetchUsers(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === 1 ? '#e5e7eb' : '#3b82f6',
                  color: currentPage === 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Previous
              </button>

              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchUsers(i + 1)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: currentPage === i + 1 ? '#3b82f6' : '#e5e7eb',
                    color: currentPage === i + 1 ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontWeight: currentPage === i + 1 ? '600' : 'normal',
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => fetchUsers(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === pagination.pages ? '#e5e7eb' : '#3b82f6',
                  color: currentPage === pagination.pages ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: currentPage === pagination.pages ? 'not-allowed' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

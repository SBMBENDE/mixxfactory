/**
 * Admin Blog Comments Management Page
 * Approve, reject, and delete comments
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, X, Trash2, MessageCircle, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  postId: string;
  name: string;
  email: string;
  message: string;
  approved: boolean;
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'approved') params.set('approved', 'true');
      if (filter === 'pending') params.set('approved', 'false');

      const response = await fetch(`/api/admin/blog/comments?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      if (data.success) {
        setComments(data.data.comments || []);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch comments');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading comments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      const response = await fetch('/api/admin/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commentId, approved: true }),
      });

      const data = await response.json();
      if (data.success) {
        setComments(comments.map((c) => (c._id === commentId ? { ...c, approved: true } : c)));
        alert('Comment approved successfully!');
      } else {
        alert(data.message || 'Failed to approve comment');
      }
    } catch (err) {
      alert('Error approving comment');
      console.error(err);
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      const response = await fetch('/api/admin/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ commentId, approved: false }),
      });

      const data = await response.json();
      if (data.success) {
        setComments(comments.map((c) => (c._id === commentId ? { ...c, approved: false } : c)));
        alert('Comment rejected successfully!');
      } else {
        alert(data.message || 'Failed to reject comment');
      }
    } catch (err) {
      alert('Error rejecting comment');
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/admin/blog/comments?id=${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        alert('Comment deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete comment');
      }
    } catch (err) {
      alert('Error deleting comment');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  const filteredComments = comments.filter((comment) => {
    if (filter === 'approved') return comment.approved;
    if (filter === 'pending') return !comment.approved;
    return true;
  });

  const pendingCount = comments.filter((c) => !c.approved).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-orange-600" />
                Blog Comments
              </h1>
              {pendingCount > 0 && (
                <p className="text-orange-600 dark:text-orange-400 mt-2">
                  {pendingCount} comment{pendingCount !== 1 ? 's' : ''} awaiting approval
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'pending', 'approved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No comments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 ${
                  comment.approved
                    ? 'border-green-500'
                    : 'border-orange-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
                      {comment.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {comment.name}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            comment.approved
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          }`}
                        >
                          {comment.approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{comment.email}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!comment.approved ? (
                      <button
                        onClick={() => handleApprove(comment._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Approve</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReject(comment._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Comment Message */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mt-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

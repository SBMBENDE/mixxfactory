/**
 * Blog Comments Component
 * Display comments and comment form
 */

'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface Props {
  postSlug: string;
}

export default function BlogComments({ postSlug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${postSlug}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/blog/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Thank you! Your comment will appear after admin approval.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setErrorMessage(data.message || 'Failed to submit comment');
      }
    } catch (error) {
      setErrorMessage('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 py-16" id="comments">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-orange-600" />
          Comments ({comments.length})
        </h2>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6 mb-12">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-lg">
                      {comment.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{comment.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comment Form */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 md:p-8 border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Leave a Comment</h3>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email * (not published)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Comment
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

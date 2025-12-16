/**
 * Professional Media Manager - Admin component to add/manage videos
 */

'use client';

import { useState } from 'react';
import { isValidMediaUrl } from '@/lib/utils/mediaExtractor';

interface ProfessionalMediaManagerProps {
  professionalId: string;
  initialMedia?: string[];
  onMediaUpdated?: (media: string[]) => void;
}

export default function ProfessionalMediaManager({
  professionalId,
  initialMedia = [],
  onMediaUpdated,
}: ProfessionalMediaManagerProps) {
  const [media, setMedia] = useState<string[]>(initialMedia);
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddMedia = async () => {
    setError('');
    setSuccess('');

    if (!inputUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    if (!isValidMediaUrl(inputUrl)) {
      setError('Invalid video URL. Use YouTube, Facebook, or Vimeo links.');
      return;
    }

    if (media.includes(inputUrl)) {
      setError('This video is already added');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/professionals/${professionalId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ media: [inputUrl] }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add media');
      }

      setMedia([...media, inputUrl]);
      setInputUrl('');
      setSuccess('Video added successfully!');
      onMediaUpdated?.([...media, inputUrl]);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add media');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMedia = async (url: string) => {
    if (!confirm('Remove this video?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/professionals/${professionalId}/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove media');
      }

      const updatedMedia = media.filter((m) => m !== url);
      setMedia(updatedMedia);
      setSuccess('Video removed');
      onMediaUpdated?.(updatedMedia);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Media Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📹 Add Video
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video URL
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleAddMedia();
                }
              }}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              ✓ YouTube • ✓ Facebook • ✓ Vimeo
            </p>
          </div>

          <button
            onClick={handleAddMedia}
            disabled={loading || !inputUrl.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            {loading ? 'Adding...' : '+ Add Video'}
          </button>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-lg text-sm">
              ✓ {success}
            </div>
          )}
        </div>
      </div>

      {/* Media Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Videos ({media.length})
        </h3>

        {media.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No videos added yet. Add one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {url.includes('youtube')
                      ? '▶ YouTube'
                      : url.includes('facebook')
                        ? 'f Facebook'
                        : url.includes('vimeo')
                          ? 'ⓥ Vimeo'
                          : '📹 Video'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {url}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMedia(url)}
                  disabled={loading}
                  className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>💡 Tip:</strong> Videos are embedded directly from their sources. No files are
          stored locally, so they don&apos;t count toward your bandwidth.
        </p>
      </div>
    </div>
  );
}

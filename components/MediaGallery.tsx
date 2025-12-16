/**
 * Media Gallery Component - Display embedded videos from YouTube, Facebook, etc.
 * Supports responsive grid layout with previews
 */

'use client';

import React, { useState } from 'react';
import { extractMediaFromUrl, MediaEmbed } from '@/lib/utils/mediaExtractor';

interface MediaGalleryProps {
  media: string[]; // Array of media URLs
  onMediaUpdated?: (media: string[]) => void;
  isLoading?: boolean;
  editable?: boolean;
}

export default function MediaGallery({
  media,
  onMediaUpdated,
  isLoading = false,
  editable = false,
}: MediaGalleryProps) {
  const [error, setError] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaEmbed[]>(
    media.map((url) => extractMediaFromUrl(url)).filter((m): m is MediaEmbed => m !== null)
  );

  const handleAddMedia = (url: string) => {
    setError('');

    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    const media = extractMediaFromUrl(url);
    if (!media || media.type === 'unknown') {
      setError('Unsupported video URL. Use YouTube, Facebook, or Vimeo links.');
      return;
    }

    if (mediaItems.some((m) => m.id === media.id)) {
      setError('This video is already added');
      return;
    }

    const updatedMedia = [...mediaItems, media];
    setMediaItems(updatedMedia);
    onMediaUpdated?.(updatedMedia.map((m) => m.url));
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMedia = mediaItems.filter((_, i) => i !== index);
    setMediaItems(updatedMedia);
    onMediaUpdated?.(updatedMedia.map((m) => m.url));
  };

  return (
    <div className="space-y-6">
      {/* Add Media Section */}
      {editable && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add Video
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video URL
              </label>
              <input
                type="url"
                placeholder="Paste YouTube, Facebook, or Vimeo link..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddMedia((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Supports: YouTube (youtube.com, youtu.be), Facebook (facebook.com, fb.watch), Vimeo
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Videos ({mediaItems.length})
        </h3>

        {mediaItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              {editable ? 'No videos added yet. Add one to get started!' : 'No videos available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail/Preview */}
                <div className="relative bg-black aspect-video flex items-center justify-center">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={`Video ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">
                        {item.type === 'youtube'
                          ? '▶'
                          : item.type === 'facebook'
                            ? 'f'
                            : item.type === 'vimeo'
                              ? 'ⓥ'
                              : '📹'}
                      </span>
                      <span className="text-white text-sm capitalize">{item.type}</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  {editable && (
                    <button
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded capitalize">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">ID: {item.id}</span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Player Modal - Could be enhanced with modal viewing */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>💡 Videos are embedded directly from their sources. No files are stored locally.</p>
      </div>
    </div>
  );
}

/**
 * Gallery Upload Component
 * Allows professionals to upload and manage portfolio images
 */

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface GalleryUploadProps {
  gallery: string[];
  onGalleryUpdated: (gallery: string[]) => void;
  isLoading?: boolean;
}

export default function GalleryUpload({
  gallery,
  onGalleryUpdated,
  isLoading = false,
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      if (data.success) {
        const newUrls = data.urls || [];
        const updatedGallery = [...gallery, ...newUrls];
        onGalleryUpdated(updatedGallery);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const updated = gallery.filter((_, i) => i !== index);
    onGalleryUpdated(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...gallery];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onGalleryUpdated(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === gallery.length - 1) return;
    const updated = [...gallery];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    onGalleryUpdated(updated);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`cursor-pointer p-4 rounded-lg text-center transition-colors ${
            dragActive
              ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-400'
              : 'bg-gray-50 dark:bg-gray-800'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            disabled={uploading || isLoading}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || isLoading}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Click to upload or drag images'}
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            PNG, JPG, GIF up to 10MB each
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {gallery.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Portfolio Gallery ({gallery.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
              >
                {/* Image */}
                <div className="relative h-32 w-full">
                  <Image
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {/* Order Controls */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="bg-white/20 hover:bg-white/40 disabled:opacity-50 text-white p-1 rounded text-sm"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === gallery.length - 1}
                      className="bg-white/20 hover:bg-white/40 disabled:opacity-50 text-white p-1 rounded text-sm"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>

                {/* Index Indicator */}
                <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Hover over images to reorder or delete. Maximum 10 images recommended.
          </p>
        </div>
      )}
    </div>
  );
}

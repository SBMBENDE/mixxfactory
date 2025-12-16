/**
 * Event Image Upload Component - Upload event posters and banners to Cloudinary
 */

'use client';

import { useState, useRef } from 'react';

interface EventImageUploadProps {
  onImageUploaded: (url: string, type: 'poster' | 'banner') => void;
  isLoading?: boolean;
  imageType: 'poster' | 'banner';
}

export default function EventImageUpload({
  onImageUploaded,
  isLoading = false,
  imageType,
}: EventImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get Cloudinary config safely
  let cloudinaryCloudName: string | undefined;
  try {
    cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  } catch (e) {
    console.error('Error reading Cloudinary config:', e);
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large (max 10MB)');
      return;
    }

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    if (!cloudinaryCloudName) {
      setError('Cloudinary not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'mixxfactory');
      formData.append('folder', 'events');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name} to Cloudinary`);
      }

      const cloudinaryData = await response.json();
      onImageUploaded(cloudinaryData.secure_url, imageType);

      // Clear input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const label = imageType === 'poster' ? 'Event Poster' : 'Event Banner';
  const aspectText = imageType === 'poster' ? '(3:4)' : '(16:9)';

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {aspectText}
      </label>

      <div className="flex gap-3">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || isLoading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium text-sm"
          >
            {uploading ? 'Uploading...' : '📸 Choose Image'}
          </button>
        </div>

        {preview && (
          <button
            type="button"
            onClick={() => setPreview('')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {preview && (
        <div className={`relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800`}>
          <img
            src={preview}
            alt={`${label} preview`}
            className={`w-full ${
              imageType === 'poster' ? 'aspect-[3/4]' : 'aspect-video'
            } object-cover`}
          />
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            ✓ Ready
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!cloudinaryCloudName && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 rounded-lg text-sm">
          ⚠️ Cloudinary not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local
        </div>
      )}
    </div>
  );
}

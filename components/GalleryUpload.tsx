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
  subscriptionTier?: string;
  maxImages?: number;
  professionalId: string;
}

export default function GalleryUpload({
  gallery,
  onGalleryUpdated,
  isLoading = false,
  subscriptionTier = 'free',
  maxImages,
  professionalId,
}: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Calculate max images based on tier
  const getMaxImages = () => {
    if (maxImages !== undefined) return maxImages;
    if (subscriptionTier === 'free') return 1;
    if (subscriptionTier === 'starter') return 5;
    return 999; // Pro = unlimited
  };

  const tierMaxImages = getMaxImages();
  const canUploadMore = gallery.length < tierMaxImages;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    // Check if can upload more
    if (!canUploadMore) {
      setError(`You've reached the maximum of ${tierMaxImages} images for your ${subscriptionTier} plan. Upgrade to add more.`);
      return;
    }

    // Check if adding these files would exceed the limit
    const remainingSlots = tierMaxImages - gallery.length;
    if (files.length > remainingSlots) {
      setError(`You can only upload ${remainingSlots} more image(s). Upgrade to ${subscriptionTier === 'free' ? 'Starter' : 'Pro'} for more space.`);
      return;
    }

    if (!cloudinaryCloudName) {
      setError('Cloudinary not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'mixxfactory');

        // Upload to Cloudinary
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          const errorText = await cloudinaryResponse.text();
          console.error('Cloudinary error:', errorText);
          throw new Error(`Failed to upload ${file.name} to Cloudinary`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        uploadedUrls.push(cloudinaryData.secure_url);
      }

      const updatedGallery = [...gallery, ...uploadedUrls];
      
      // Save to database
      const response = await fetch(`/api/admin/professionals/${professionalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gallery: updatedGallery }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save gallery');
      }

      onGalleryUpdated(updatedGallery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload error');
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (index: number) => {
    const updated = gallery.filter((_, i) => i !== index);
    
    try {
      // Save to database
      const response = await fetch(`/api/admin/professionals/${professionalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gallery: updated }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update gallery');
      }

      onGalleryUpdated(updated);
    } catch (err) {
      console.error('Failed to remove image:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove image');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...gallery];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    
    try {
      const response = await fetch(`/api/admin/professionals/${professionalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gallery: updated }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update gallery');
      }

      onGalleryUpdated(updated);
    } catch (err) {
      console.error('Failed to reorder:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === gallery.length - 1) return;
    const updated = [...gallery];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    
    try {
      const response = await fetch(`/api/admin/professionals/${professionalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ gallery: updated }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update gallery');
      }

      onGalleryUpdated(updated);
    } catch (err) {
      console.error('Failed to reorder:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder');
    }
  };

  return (
    <div className="space-y-4">
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
        disabled={uploading || isLoading || !canUploadMore}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
      >
        {uploading ? 'Uploading...' : canUploadMore ? 'Upload Gallery Images' : `Max ${tierMaxImages} images`}
      </button>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        {gallery.length}/{tierMaxImages} images used
      </p>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

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
        </div>
      )}
    </div>
  );
}

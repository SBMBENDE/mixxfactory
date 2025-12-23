/**
 * Image Upload Component - For admin to add images to professionals
 * Integrates with Cloudinary for direct file uploads
 */

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  professionalId: string;
  onImagesAdded: (newImages: string[]) => void;
  isLoading?: boolean;
}

export default function ImageUpload({
  professionalId,
  onImagesAdded,
  isLoading = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState<{ file: File; preview: string }[]>([]);
  const [imageUrls, setImageUrls] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');

    try {
      const newPreviews: { file: File; preview: string }[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 10MB)`);
        }

        // Create object URL for preview
        const preview = URL.createObjectURL(file);
        newPreviews.push({ file, preview });
      }

      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrlImages = async () => {
    if (!imageUrls.trim()) {
      setError('Please enter at least one image URL');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const urls = imageUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      // Validate URLs
      for (const url of urls) {
        try {
          new URL(url);
        } catch {
          throw new Error(`Invalid URL: ${url}`);
        }
      }

      if (urls.length === 0) {
        setError('Please enter at least one valid URL');
        return;
      }

      // Call API to add images
      const response = await fetch(`/api/admin/professionals/${professionalId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ images: urls }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add images');
      }

      setImageUrls('');
      onImagesAdded(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = (index: number) => {
    setPreviewUrls((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleUploadToCloudinary = async () => {
    if (previewUrls.length === 0) {
      setError('No files selected');
      return;
    }

    if (!cloudinaryCloudName) {
      setError(
        'Cloudinary not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local'
      );
      return;
    }

    setError('');
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const { file } of previewUrls) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'mixxfactory'); // You can customize this

        // Upload to Cloudinary
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          throw new Error(`Failed to upload ${file.name} to Cloudinary`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        uploadedUrls.push(cloudinaryData.secure_url);
      }

      // Save to database
      const response = await fetch(`/api/admin/professionals/${professionalId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ images: uploadedUrls }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save images');
      }

      // Clean up previews
      previewUrls.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setPreviewUrls([]);
      onImagesAdded(uploadedUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Images
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        {/* Tab Selection */}
        <div className="space-y-6">
          {/* Method 1: Paste URLs */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Method 1: Paste Image URLs
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Paste one image URL per line. Works with Cloudinary, Imgur, or any public image URL.
            </p>
            <textarea
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              disabled={uploading}
            />
            <button
              onClick={handleAddUrlImages}
              disabled={uploading || isLoading}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {uploading ? 'Adding Images...' : 'Add Images from URLs'}
            </button>
          </div>

          {/* Method 2: Upload Files to Cloudinary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Method 2: Upload Files to Cloudinary
            </h4>
            {cloudinaryCloudName ? (
              <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                ✓ Cloudinary is configured and ready!
              </p>
            ) : (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">
                ⚠️ Configure Cloudinary in .env.local to enable direct uploads.
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={handleFileUploadClick}
              disabled={uploading || isLoading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              {uploading ? 'Uploading...' : 'Select Files from Computer'}
            </button>

            {/* Preview Selected Files */}
            {previewUrls.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Files ({previewUrls.length}):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {previewUrls.map((item, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden bg-gray-200">
                      <Image
                        src={item.preview}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover"
                        priority={false}
                      />
                      <button
                        onClick={() => handleRemovePreview(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <span className="text-white text-sm font-semibold">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUploadToCloudinary}
                  disabled={uploading || isLoading || !cloudinaryCloudName}
                  className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {uploading ? 'Uploading...' : `Upload ${previewUrls.length} File(s) to Cloudinary`}
                </button>
              </div>
            )}
          </div>

          {/* Setup Instructions */}
          {!cloudinaryCloudName && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
                💡 Setup Cloudinary for File Uploads
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Sign up at cloudinary.com (free account)</li>
                <li>Get your Cloud Name from the dashboard</li>
                <li>Add to .env.local: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name</li>
                <li>Create upload preset: Settings → Upload → Add upload preset (unsigned, mode: unsigned)</li>
                <li>Restart dev server</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Image Upload Component - For admin to add images to professionals
 */

'use client';

import { useState, useRef } from 'react';

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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');
    setUploading(true);

    try {
      // Note: In production, you'd upload to Cloudinary here
      // For now, we'll use a file to data URL approach for local testing
      // Then switch to Cloudinary API when credentials are configured

      const newUrls: string[] = [];

      for (const file of files) {
        // Create object URL for preview
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      }

      setPreviewUrls((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setUploading(false);
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

  const handleRemovePreview = (url: string) => {
    setPreviewUrls(previewUrls.filter((u) => u !== url));
  };

  const handleUploadPreviews = async () => {
    if (previewUrls.length === 0) {
      setError('No files selected');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // In production, upload to Cloudinary and get permanent URLs
      // For now, we'll just use the preview URLs
      // This is a placeholder - implement Cloudinary upload here

      const response = await fetch(`/api/admin/professionals/${professionalId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ images: previewUrls }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload images');
      }

      setPreviewUrls([]);
      onImagesAdded(previewUrls);
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
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Method 1: Paste Image URLs</h4>
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

          {/* Method 2: File Upload (Placeholder) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Method 2: Upload Files
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              ⚠️ File upload requires Cloudinary integration. Configure in .env.local for production use.
            </p>
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
              {uploading ? 'Processing...' : 'Select Files from Computer'}
            </button>

            {/* Preview Selected Files */}
            {previewUrls.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Files ({previewUrls.length}):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {previewUrls.map((url) => (
                    <div key={url} className="relative group rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-24 object-cover"
                      />
                      <button
                        onClick={() => handleRemovePreview(url)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <span className="text-white text-sm font-semibold">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUploadPreviews}
                  disabled={uploading || isLoading}
                  className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {uploading ? 'Uploading...' : `Upload ${previewUrls.length} File(s)`}
                </button>
              </div>
            )}
          </div>

          {/* Cloudinary Integration Notice */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Tip:</strong> To enable direct file uploads with automatic optimization, configure
              Cloudinary in your .env.local:
            </p>
            <code className="block mt-2 text-xs bg-blue-100 dark:bg-blue-900/40 p-2 rounded">
              NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

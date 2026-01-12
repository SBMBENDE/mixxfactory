/**
 * Image Upload Component - For admin to add images to professionals
 * Integrates with Cloudinary for direct file uploads
 */

'use client';

import { useState, useRef } from 'react';
import { AppImage } from './AppImage';

interface ImageUploadProps {
  professionalId: string;
  onImagesAdded: (newImages: string[]) => void;
  isLoading?: boolean;
  manualSave?: boolean;
  replaceMode?: boolean; // If true, replaces all images instead of adding
}

export default function ImageUpload({
  professionalId,
  onImagesAdded,
  isLoading = false,
  manualSave = false,
  replaceMode = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFiles = async (filesToUpload: { file: File; preview: string }[]) => {
    if (filesToUpload.length === 0) {
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

      for (const { file } of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'mixxfactory');

        console.log('Uploading file to Cloudinary:', file);
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        console.log('Cloudinary response status:', cloudinaryResponse.status);
        if (!cloudinaryResponse.ok) {
          const errorText = await cloudinaryResponse.text();
          console.error('Cloudinary error:', errorText);
          throw new Error(`Failed to upload ${file.name} to Cloudinary`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        console.log('Cloudinary upload result:', cloudinaryData);
        uploadedUrls.push(cloudinaryData.secure_url);
      }

      // Clean up previews
      filesToUpload.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setPreviewUrls([]);

      if (manualSave) {
        onImagesAdded(uploadedUrls);
      } else {
        // Save to database
        if (replaceMode) {
          // Replace mode: Use PUT to update the images array
          const response = await fetch(`/api/admin/professionals/${professionalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ images: uploadedUrls }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to save image');
          }
        } else {
          // Add mode: Use POST to append images
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
        }
        onImagesAdded(uploadedUrls);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError('');

    try {
      // In replace mode, only take the first file
      const filesToProcess = replaceMode ? [files[0]] : files;
      
      // Clear previous previews in replace mode
      if (replaceMode) {
        previewUrls.forEach(({ preview }) => URL.revokeObjectURL(preview));
        setPreviewUrls([]);
      }

      const newPreviews: { file: File; preview: string }[] = [];

      for (const file of filesToProcess) {
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

      setPreviewUrls((prev) => replaceMode ? newPreviews : [...prev, ...newPreviews]);
      
      // In replace mode, auto-upload immediately
      if (replaceMode && newPreviews.length > 0) {
        await uploadFiles(newPreviews);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    await uploadFiles(previewUrls);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      {!cloudinaryCloudName && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">
          ⚠️ Configure Cloudinary in .env.local to enable uploads.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
        {...(!replaceMode && { multiple: true })}
      />
      <button
        onClick={handleFileUploadClick}
        disabled={uploading || isLoading || !cloudinaryCloudName}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
      >
        {uploading ? 'Uploading...' : 'Select from Device'}
      </button>

      {/* Preview Selected Files - only show in non-replace mode */}
      {!replaceMode && previewUrls.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {previewUrls.map((item, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden bg-gray-200">
                      <AppImage
                        src={item.preview}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover"
                        objectFit="cover"
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
                {uploading ? 'Uploading...' : `Upload ${previewUrls.length} File(s)`}
              </button>
            </div>
          )}

      {/* Setup Instructions */}
      {!cloudinaryCloudName && (
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
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
  );
}

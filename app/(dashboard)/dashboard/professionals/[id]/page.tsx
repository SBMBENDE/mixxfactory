/**
 * Admin Professional Edit Page with Image Management
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import ImageGallery from '@/components/ImageGallery';
import GalleryUpload from '@/components/GalleryUpload';

interface Professional {
  _id: string;
  name: string;
  images: string[];
  gallery?: string[];
  verified?: boolean;
  bio?: string;
  [key: string]: any;
}

export default function EditProfessionalPage() {
  const router = useRouter();
  const params = useParams();
  const professionalId = params?.id as string;

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch professional on load
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const response = await fetch(`/api/admin/professionals/${professionalId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load professional');
        }

        const data = await response.json();
        if (data.success) {
          setProfessional(data.data);
        } else {
          setError(data.message || 'Failed to load professional');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading professional');
      } finally {
        setLoading(false);
      }
    };

    if (professionalId) {
      fetchProfessional();
    }
  }, [professionalId]);

  const handleImagesAdded = (newImages: string[]) => {
    if (professional) {
      const updatedImages = [...professional.images, ...newImages];
      setProfessional({ ...professional, images: updatedImages });
      setSuccess(`Added ${newImages.length} image(s)`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!professional) return;

    try {
      const response = await fetch(
        `/api/admin/professionals/${professional._id}/images`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ imageUrl }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setProfessional({
        ...professional,
        images: professional.images.filter((img) => img !== imageUrl),
      });
      setSuccess('Image deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting image');
    }
  };

  const handleReorderImages = async (reorderedImages: string[]) => {
    if (!professional) return;

    try {
      setSaving(true);
      const response = await fetch(
        `/api/admin/professionals/${professional._id}/images`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ images: reorderedImages }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reorder images');
      }

      setProfessional({
        ...professional,
        images: reorderedImages,
      });
      setSuccess('Images reordered');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reordering images');
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryUpdated = async (updatedGallery: string[]) => {
    if (!professional) return;

    try {
      setSaving(true);
      const response = await fetch(
        `/api/admin/professionals/${professional._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ gallery: updatedGallery }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update gallery');
      }

      setProfessional({
        ...professional,
        gallery: updatedGallery,
      });
      setSuccess('Gallery updated');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating gallery');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-gray-600 dark:text-gray-400">
        Loading professional...
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 p-4 rounded-lg">
        Professional not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {professional.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage images and gallery
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-lg">
          ✓ {success}
        </div>
      )}

      {/* Image Upload Component */}
      <ImageUpload
        professionalId={professional._id}
        onImagesAdded={handleImagesAdded}
        isLoading={saving}
      />

      {/* Portfolio Gallery Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio Gallery
        </h3>
        <GalleryUpload
          gallery={professional.gallery || []}
          onGalleryUpdated={handleGalleryUpdated}
          isLoading={saving}
        />
      </div>

      {/* Image Gallery with Management */}
      {professional.images && professional.images.length > 0 ? (
        <ImageGallery
          images={professional.images}
          title="Current Images"
          isAdmin={true}
          onDeleteImage={handleDeleteImage}
          onReorderImages={handleReorderImages}
        />
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No images yet. Add some using the upload section above.
          </p>
        </div>
      )}

      {/* Bio and Verification Badge */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Profile Settings
        </h3>

        {/* Bio Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Professional Bio
          </label>
          <textarea
            value={professional.bio || ''}
            onChange={(e) => setProfessional({ ...professional, bio: e.target.value })}
            onBlur={async () => {
              try {
                setSaving(true);
                const response = await fetch(
                  `/api/admin/professionals/${professional._id}`,
                  {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ bio: professional.bio }),
                  }
                );

                if (!response.ok) {
                  throw new Error('Failed to update bio');
                }

                setSuccess('Bio updated');
                setTimeout(() => setSuccess(''), 2000);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : 'Error updating bio'
                );
              } finally {
                setSaving(false);
              }
            }}
            placeholder="Write a detailed bio about this professional..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white h-32 resize-none"
            disabled={saving}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {professional.bio?.length || 0} / 500 characters
          </p>
        </div>

        {/* Verification Badge Toggle */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-lg">✓</span>
                Verification Badge
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Mark this professional as verified for a badge on their profile
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  setSaving(true);
                  const newVerified = !professional.verified;
                  const response = await fetch(
                    `/api/admin/professionals/${professional._id}`,
                    {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ verified: newVerified }),
                    }
                  );

                  if (!response.ok) {
                    throw new Error('Failed to update verification status');
                  }

                  setProfessional({
                    ...professional,
                    verified: newVerified,
                  });
                  setSuccess(
                    newVerified
                      ? 'Professional verified ✓'
                      : 'Verification removed'
                  );
                  setTimeout(() => setSuccess(''), 2000);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : 'Error updating verification'
                  );
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                professional.verified
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  professional.verified ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {professional.verified && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-lg text-sm">
              ✓ This professional is verified and will display a verification badge
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Image Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Images</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {professional.images?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Primary Image</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {professional.images && professional.images.length > 0 ? '✓' : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gallery</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.max(0, (professional.images?.length || 0) - 1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

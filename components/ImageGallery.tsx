/**
 * Image Gallery Component - Displays professional images with lightbox
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  title: string;
  isAdmin?: boolean;
  onDeleteImage?: (imageUrl: string) => Promise<void>;
  onReorderImages?: (images: string[]) => Promise<void>;
}

export default function ImageGallery({
  images,
  title,
  isAdmin = false,
  onDeleteImage,
  onReorderImages,
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localImages, setLocalImages] = useState(images);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No images available</p>
      </div>
    );
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!onDeleteImage) return;
    setIsDeleting(imageUrl);
    try {
      await onDeleteImage(imageUrl);
      setLocalImages(localImages.filter((img) => img !== imageUrl));
    } catch (error) {
      console.error('Failed to delete image:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newImages = [...localImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    setLocalImages(newImages);
    setDraggedIndex(null);

    if (onReorderImages) {
      try {
        await onReorderImages(newImages);
      } catch (error) {
        console.error('Failed to reorder images:', error);
        setLocalImages(images); // Revert on error
      }
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % localImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + localImages.length) % localImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Gallery Grid */}
      <div className="w-full max-w-4xl mx-auto overflow-x-hidden">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 min-w-[280px] sm:min-w-[420px] md:min-w-[560px]">
          {localImages.map((imageUrl, index) => (
            <div
              key={imageUrl}
              draggable={isAdmin}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`relative group rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 aspect-square cursor-pointer ${
                isAdmin ? 'hover:ring-2 hover:ring-blue-500' : ''
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <Image
                src={imageUrl}
                alt={`${title} image ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setLightboxOpen(true);
                }}
              />

              {/* Image Index Badge */}
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-semibold">
                {index + 1}
              </div>

              {/* Delete Button (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => handleDeleteImage(imageUrl)}
                  disabled={isDeleting === imageUrl}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Delete image"
                >
                  {isDeleting === imageUrl ? (
                    <span>...</span>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              )}

              {/* Drag Handle (Admin Only) */}
              {isAdmin && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {isAdmin ? 'Drag to reorder, hover to delete' : ''}
          </p>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Main Image */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              <Image
                src={localImages[currentImageIndex]}
                alt={`${title} image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation */}
            {localImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
                >
                  →
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
            >
              ✕
            </button>

            {/* Counter */}
            <div className="text-center mt-4 text-white text-sm">
              {currentImageIndex + 1} / {localImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Reusable Image Component
 * Wraps next/image with consistent props and defaults
 * Prevents common mistakes and ensures optimal performance
 */

import { CSSProperties } from 'react';
import Image from 'next/image';

interface AppImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  objectPosition?: string;
  style?: CSSProperties;
}

export function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  objectFit = 'cover',
  objectPosition = 'center',
  style,
}: AppImageProps) {
  // If using fill, sizes must be provided
  if (fill && !sizes) {
    console.warn(`AppImage: fill=true but sizes not provided for ${alt}`);
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
        style={{
          objectFit,
          objectPosition,
          ...style,
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      priority={priority}
      style={{
        objectFit,
        objectPosition,
        ...style,
      }}
    />
  );
}

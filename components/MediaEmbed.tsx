/**
 * Media Embed Component - Display embedded videos responsively
 */

'use client';

import React from 'react';
import { extractMediaFromUrl } from '@/lib/utils/mediaExtractor';

interface MediaEmbedProps {
  url: string;
  title?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
}

export default function MediaEmbed({
  url,
  title,
  className = '',
  aspectRatio = 'video',
}: MediaEmbedProps) {
  const media = extractMediaFromUrl(url);

  if (!media || media.type === 'unknown') {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {url}
          </a>
        </p>
      </div>
    );
  }

  const aspectRatioClass = {
    video: 'aspect-video', // 16:9
    square: 'aspect-square', // 1:1
    wide: 'aspect-[21/9]', // 21:9
  }[aspectRatio];

  return (
    <div className={`${aspectRatioClass} w-full bg-black rounded-lg overflow-hidden ${className}`}>
      {media.type === 'youtube' && (
        <iframe
          width="100%"
          height="100%"
          src={media.embedUrl}
          title={title || 'YouTube Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )}

      {media.type === 'facebook' && (
        <iframe
          width="100%"
          height="100%"
          src={media.embedUrl}
          title={title || 'Facebook Video'}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      )}

      {media.type === 'vimeo' && (
        <iframe
          width="100%"
          height="100%"
          src={media.embedUrl}
          title={title || 'Vimeo Video'}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )}
    </div>
  );
}

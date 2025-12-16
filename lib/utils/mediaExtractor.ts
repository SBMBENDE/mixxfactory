/**
 * Media Extractor - Parse YouTube, Facebook, and other video URLs
 * Extracts media IDs and generates embed codes
 */

export interface MediaEmbed {
  type: 'youtube' | 'facebook' | 'vimeo' | 'unknown';
  id: string;
  url: string;
  embedUrl: string;
  thumbnail?: string;
  title?: string;
}

/**
 * Parse YouTube URLs and extract video ID
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export function extractYouTubeVideo(url: string): MediaEmbed | null {
  try {
    const urlObj = new URL(url);
    let videoId = '';

    // youtu.be/ID format
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    }
    // youtube.com/watch?v=ID format
    else if (urlObj.hostname?.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    }
    // youtube.com/embed/ID format
    else if (urlObj.pathname.includes('/embed/')) {
      videoId = urlObj.pathname.split('/embed/')[1].split('?')[0];
    }

    if (!videoId) return null;

    return {
      type: 'youtube',
      id: videoId,
      url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch {
    return null;
  }
}

/**
 * Parse Facebook video URLs
 * Supports: facebook.com/watch/?v=ID, fb.watch/ID, facebook.com/video/ID
 */
export function extractFacebookVideo(url: string): MediaEmbed | null {
  try {
    const urlObj = new URL(url);
    let videoId = '';

    // facebook.com/watch/?v=ID format
    if (urlObj.searchParams.has('v')) {
      videoId = urlObj.searchParams.get('v') || '';
    }
    // facebook.com/video/ID format
    else if (urlObj.pathname.includes('/video/')) {
      videoId = urlObj.pathname.split('/video/')[1].split('/')[0];
    }
    // facebook.com/reel/ID format
    else if (urlObj.pathname.includes('/reel/')) {
      videoId = urlObj.pathname.split('/reel/')[1].split('/')[0];
    }

    if (!videoId) return null;

    return {
      type: 'facebook',
      id: videoId,
      url,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=500&show_text=true`,
    };
  } catch {
    return null;
  }
}

/**
 * Parse Vimeo video URLs
 * Supports: vimeo.com/ID
 */
export function extractVimeoVideo(url: string): MediaEmbed | null {
  try {
    const urlObj = new URL(url);
    let videoId = '';

    if (urlObj.hostname?.includes('vimeo.com')) {
      videoId = urlObj.pathname.split('/').filter(Boolean)[0];
    }

    if (!videoId || isNaN(Number(videoId))) return null;

    return {
      type: 'vimeo',
      id: videoId,
      url,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      thumbnail: `https://vimeo.com/api/v2/video/${videoId}.json`,
    };
  } catch {
    return null;
  }
}

/**
 * Auto-detect media type and extract
 */
export function extractMediaFromUrl(url: string): MediaEmbed | null {
  if (!url) return null;

  // Try each parser
  const youtube = extractYouTubeVideo(url);
  if (youtube) return youtube;

  const facebook = extractFacebookVideo(url);
  if (facebook) return facebook;

  const vimeo = extractVimeoVideo(url);
  if (vimeo) return vimeo;

  return {
    type: 'unknown',
    id: url,
    url,
    embedUrl: url,
  };
}

/**
 * Generate responsive embed HTML
 */
export function generateEmbedHTML(media: MediaEmbed): string {
  switch (media.type) {
    case 'youtube':
      return `<iframe width="100%" height="500" src="${media.embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

    case 'facebook':
      return `<div style="width: 100%; max-width: 500px;"><iframe src="${media.embedUrl}" width="500" height="500" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe></div>`;

    case 'vimeo':
      return `<iframe width="100%" height="500" src="${media.embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

    default:
      return `<a href="${media.url}" target="_blank" rel="noopener noreferrer">${media.url}</a>`;
  }
}

/**
 * Validate if URL is a valid video URL
 */
export function isValidMediaUrl(url: string): boolean {
  const media = extractMediaFromUrl(url);
  return media !== null && media.type !== 'unknown';
}

/**
 * Extract multiple media URLs from text (one per line)
 */
export function extractMediaFromText(text: string): MediaEmbed[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((url) => extractMediaFromUrl(url))
    .filter((media): media is MediaEmbed => media !== null);
}

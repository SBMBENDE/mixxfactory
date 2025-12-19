/**
 * Video URL validation and extraction utilities
 */

export interface VideoData {
  url: string;
  platform: 'youtube' | 'facebook' | 'vimeo';
  videoId: string;
  embedUrl: string;
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract Facebook video ID from video URL
 * Supports:
 * - https://www.facebook.com/watch/?v=VIDEO_ID
 * - https://www.facebook.com/username/videos/VIDEO_ID
 */
export function extractFacebookId(url: string): string | null {
  const patterns = [
    /facebook\.com\/watch\/\?v=(\d+)/,
    /facebook\.com\/.*\/videos\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract Vimeo video ID from URL
 * Supports:
 * - https://vimeo.com/VIDEO_ID
 */
export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Detect video platform from URL
 */
export function detectPlatform(url: string): 'youtube' | 'facebook' | 'vimeo' | null {
  if (extractYouTubeId(url)) return 'youtube';
  if (extractFacebookId(url)) return 'facebook';
  if (extractVimeoId(url)) return 'vimeo';
  return null;
}

/**
 * Create embed URL for different platforms
 */
export function getEmbedUrl(platform: string, videoId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    case 'facebook':
      return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${videoId}&show_text=false&width=560`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`;
    default:
      return '';
  }
}

/**
 * Validate and parse video URL
 */
export function validateVideoUrl(url: string): VideoData | null {
  const trimmedUrl = url.trim();
  
  // Try YouTube
  const ytId = extractYouTubeId(trimmedUrl);
  if (ytId) {
    return {
      url: trimmedUrl,
      platform: 'youtube',
      videoId: ytId,
      embedUrl: getEmbedUrl('youtube', ytId),
    };
  }
  
  // Try Facebook
  const fbId = extractFacebookId(trimmedUrl);
  if (fbId) {
    return {
      url: trimmedUrl,
      platform: 'facebook',
      videoId: fbId,
      embedUrl: getEmbedUrl('facebook', fbId),
    };
  }
  
  // Try Vimeo
  const vmId = extractVimeoId(trimmedUrl);
  if (vmId) {
    return {
      url: trimmedUrl,
      platform: 'vimeo',
      videoId: vmId,
      embedUrl: getEmbedUrl('vimeo', vmId),
    };
  }
  
  return null;
}

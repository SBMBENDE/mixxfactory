/**
 * URL slug utilities
 */

/**
 * Generate URL-friendly slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Format URL parameter
 */
export function formatUrlParam(param: string): string {
  return encodeURIComponent(param.toLowerCase().trim());
}

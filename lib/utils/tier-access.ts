/**
 * Subscription Tier Access Control Utilities
 */

import { SubscriptionTier } from '@/types/payment';

// Feature flags by tier
export const TIER_FEATURES = {
  free: {
    dashboard: false,
    gallery: false,
    maxImages: 1, // Profile picture only
    analytics: false,
    inquiries: false,
    calendar: false,
    reviews: true,
    profileEdit: true,
    socialLinks: false,
    contactInfo: false, // Hide phone, email, website on public profile
    socialLinksPublic: false, // Hide social links on public profile
    maxDescriptionLength: 250, // Character limit for description
  },
  starter: {
    dashboard: true,
    gallery: true,
    maxImages: 5,
    analytics: false,
    inquiries: true,
    calendar: false,
    reviews: true,
    profileEdit: true,
    socialLinks: true,
    contactInfo: true,
    socialLinksPublic: true,
    maxDescriptionLength: -1, // Unlimited
  },
  pro: {
    dashboard: true,
    gallery: true,
    maxImages: -1, // Unlimited
    analytics: true,
    inquiries: true,
    calendar: true,
    reviews: true,
    profileEdit: true,
    socialLinks: true,
    contactInfo: true,
    socialLinksPublic: true,
    maxDescriptionLength: -1, // Unlimited
  },
} as const;

/**
 * Check if a tier has access to a specific feature
 */
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof typeof TIER_FEATURES.free
): boolean {
  const value = TIER_FEATURES[tier]?.[feature];
  // Handle both boolean and number values (e.g., maxGalleryImages)
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}

/**
 * Get maximum images allowed for a tier
 */
export function getMaxImages(tier: SubscriptionTier): number {
  return TIER_FEATURES[tier]?.maxImages ?? 1;
}

/**
 * Check if tier can access dashboard
 */
export function canAccessDashboard(tier: SubscriptionTier): boolean {
  return TIER_FEATURES[tier]?.dashboard ?? false;
}

/**
 * Check if tier can use gallery
 */
export function canUseGallery(tier: SubscriptionTier): boolean {
  return TIER_FEATURES[tier]?.gallery ?? false;
}

/**
 * Get maximum description length for a tier
 */
export function getMaxDescriptionLength(tier: SubscriptionTier): number {
  return TIER_FEATURES[tier]?.maxDescriptionLength ?? 250;
}

/**
 * Get tier display name with badge
 */
export function getTierBadge(tier: SubscriptionTier): {
  name: string;
  color: string;
  bgColor: string;
} {
  const badges = {
    free: { name: 'Free', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    starter: { name: 'Starter', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    pro: { name: 'Pro', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  };
  return badges[tier] ?? badges.free;
}

/**
 * Get upgrade message for restricted feature
 */
export function getUpgradeMessage(
  feature: string,
  currentTier: SubscriptionTier
): string {
  const messages: Record<string, string> = {
    dashboard: 'Upgrade to Starter or higher to access the professional dashboard',
    gallery: 'Upgrade to Starter or higher to add gallery images',
    analytics: 'Upgrade to Pro to view analytics',
    calendar: 'Upgrade to Pro to access the calendar',
  };
  return messages[feature] ?? `Upgrade from ${currentTier} to unlock this feature`;
}

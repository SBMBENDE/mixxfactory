/**
 * Featured Professionals - Server Component
 * Fetches data server-side, streams via Suspense
 * Properly implements ISR with revalidate
 * 
 * PERFORMANCE NOTE:
 * - Long revalidate time (1 hour) to avoid slow DB queries
 * - MongoDB Atlas free tier can be very slow (80-120s per query)
 * - ISR caching helps deliver fast page loads
 */

export const revalidate = 3600; // Revalidate every 1 hour (was 60s)

import FeaturedProfessionalsServer from '@/components/FeaturedProfessionalsServer';
import { getFeaturedProfessionals } from '@/lib/homepage-data';

export default async function FeaturedProfessionals() {
  try {
    const professionals = await getFeaturedProfessionals();

    if (!professionals || professionals.length === 0) {
      console.log('[FeaturedProfessionals] No professionals returned, rendering nothing');
      return null;
    }

    console.log('[FeaturedProfessionals] Rendering', professionals.length, 'professionals');
    return <FeaturedProfessionalsServer professionals={professionals} />;
  } catch (error) {
    // If database query fails/times out, log error but don't crash the page
    console.error('[FeaturedProfessionals] Error fetching professionals:', error);
    return null; // Gracefully hide section if data fetch fails
  }
}

/**
 * Featured Professionals - Server Component
 * Fetches data server-side, streams via Suspense
 * Properly implements ISR with revalidate
 */

export const revalidate = 60;

import FeaturedProfessionalsServer from '@/components/FeaturedProfessionalsServer';
import { getFeaturedProfessionals } from '@/lib/homepage-data';

export default async function FeaturedProfessionals() {
  const professionals = await getFeaturedProfessionals();

  if (!professionals || professionals.length === 0) {
    return null;
  }

  return <FeaturedProfessionalsServer professionals={professionals} />;
}

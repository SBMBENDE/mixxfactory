/**
 * Server-side wrapper for FeaturedProfessionals
 * Fetches data on the server and passes it as props
 * This enables ISR prerendering and shows content immediately
 */

import { FeaturedProfessionalsClient } from './FeaturedProfessionals';

interface Professional {
  _id: string;
  name: string;
  slug: string;
  profilePicture?: string;
  description?: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface ApiResponse {
  success: boolean;
  data?: {
    data: Professional[];
    total: number;
  };
  error?: string;
}

export default async function FeaturedProfessionalsServer() {
  try {
    // Fetch on server with ISR caching
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/professionals?sort=rating&limit=8`, {
      cache: 'force-cache',
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!response.ok) {
      console.error('[FeaturedProfessionalsServer] API error:', response.status);
      return <FeaturedProfessionalsClient initialProfessionals={[]} />;
    }

    const data: ApiResponse = await response.json();

    if (!data.success || !data.data?.data) {
      console.error('[FeaturedProfessionalsServer] Invalid response:', data);
      return <FeaturedProfessionalsClient initialProfessionals={[]} />;
    }

    // Filter featured professionals or show all if none are featured
    const featured = data.data.data.filter((p: Professional) => p.featured);
    const toShow = featured.length > 0 ? featured : data.data.data;

    return <FeaturedProfessionalsClient initialProfessionals={toShow.slice(0, 8)} />;
  } catch (error) {
    console.error('[FeaturedProfessionalsServer] Fetch error:', error);
    return <FeaturedProfessionalsClient initialProfessionals={[]} />;
  }
}

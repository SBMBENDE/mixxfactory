/**
 * Server-side data fetching for homepage
 * Runs on the server, cached with ISR
 * No authentication required - public data only
 */

interface Professional {
  _id: string;
  name: string;
  slug: string;
  profilePicture?: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface HomepageData {
  professionals: Professional[];
  categories: Category[];
  newsFlashes: any[];
}

export async function getHomepageData(): Promise<HomepageData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Fetch all data in parallel
    const [profRes, catRes, newsRes] = await Promise.all([
      // Featured professionals - sort by rating, limit to 4 to reduce payload
      fetch(`${baseUrl}/api/professionals?sort=rating&limit=4&lean=true`, {
        next: { revalidate: 300 }, // 5 minutes
      }),
      // Categories for popular section
      fetch(`${baseUrl}/api/categories`, {
        next: { revalidate: 3600 }, // 1 hour
      }),
      // News flashes for banner
      fetch(`${baseUrl}/api/news-flashes?published=true&limit=3`, {
        next: { revalidate: 300 }, // 5 minutes
      }),
    ]);

    // Parse responses
    const [profData, catData, newsData] = await Promise.all([
      profRes.json(),
      catRes.json(),
      newsRes.json().catch(() => ({ data: [] })), // News flashes are optional
    ]);

    // Extract and process professionals - prefer featured
    let professionals: Professional[] = [];
    if (profData.success && profData.data?.data) {
      const allProfs = profData.data.data;
      const featured = allProfs.filter((p: Professional) => p.featured);
      professionals = (featured.length > 0 ? featured : allProfs).slice(0, 8);
    }

    // Extract categories
    const categories: Category[] = (catData.success ? catData.data : catData.data || []).slice(0, 7);

    // Extract news flashes
    const newsFlashes = (newsData.data || []).slice(0, 3);

    return {
      professionals,
      categories,
      newsFlashes,
    };
  } catch (error) {
    console.error('[getHomepageData] Error fetching homepage data:', error);
    // Return empty safe data on error
    return {
      professionals: [],
      categories: [],
      newsFlashes: [],
    };
  }
}

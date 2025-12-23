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
    console.log('[getHomepageData] Starting fetch...');
    
    // Build absolute URL for server-side fetching
    // In development: http://localhost:3000
    // In production: https://mixxfactory.vercel.app
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    console.log('[getHomepageData] Using baseUrl:', baseUrl);
    
    // Don't cache these fetches - let the API handle caching instead
    // ISR will handle page-level caching via the revalidate export
    const [profRes, catRes, newsRes] = await Promise.all([
      // Featured professionals - no cache revalidate (API handles it)
      fetch(`${baseUrl}/api/professionals?sort=rating&limit=4&lean=true`, {
        // No caching at fetch level - causes "over 2MB" error
      }),
      // Categories for popular section
      fetch(`${baseUrl}/api/categories`, {
        // No caching at fetch level - causes "over 2MB" error
      }),
      // News flashes for banner
      fetch(`${baseUrl}/api/news-flashes?published=true&limit=3`, {
        // No caching at fetch level - causes "over 2MB" error
      }),
    ]);

    console.log('[getHomepageData] Fetches completed, parsing responses...');

    // Parse responses
    const [profData, catData, newsData] = await Promise.all([
      profRes.json(),
      catRes.json(),
      newsRes.json().catch(() => ({ data: [] })), // News flashes are optional
    ]);

    console.log('[getHomepageData] Responses parsed successfully');

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

    console.log('[getHomepageData] Data processed:', { 
      professionals: professionals.length,
      categories: categories.length,
      newsFlashes: newsFlashes.length
    });

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

/**
 * Server-side data fetching for homepage
 * Runs on the server, cached with ISR
 * No authentication required - public data only
 */

import { connectDBWithTimeout } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';

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
    console.log('[getHomepageData] Starting direct database fetch...');
    
    // Connect to database directly instead of fetching through API
    // This avoids external URL issues on Vercel
    await connectDBWithTimeout();
    console.log('[getHomepageData] Database connected');

    // Fetch professionals directly from DB
    const professionals = await ProfessionalModel.find({ active: true })
      .populate('category', 'name slug')
      .sort({ featured: -1, rating: -1, reviewCount: -1 })
      .limit(4)
      .lean()
      .exec();

    console.log('[getHomepageData] Professionals fetched:', professionals.length);

    // Fetch categories directly from DB
    const categories = await CategoryModel.find({})
      .sort({ name: 1 })
      .limit(7)
      .lean()
      .exec();

    console.log('[getHomepageData] Categories fetched:', categories.length);

    // For now, return empty news flashes (optional field)
    const newsFlashes: any[] = [];

    // Convert ObjectIds to strings for frontend compatibility
    const processedProfessionals = professionals.map((prof: any) => ({
      _id: prof._id?.toString(),
      name: prof.name,
      slug: prof.slug,
      profilePicture: prof.profilePicture,
      featured: prof.featured,
      rating: prof.rating,
      reviewCount: prof.reviewCount,
      category: prof.category ? {
        _id: prof.category._id?.toString(),
        name: prof.category.name,
        slug: prof.category.slug,
      } : undefined,
    }));

    const processedCategories = categories.map((cat: any) => ({
      _id: cat._id?.toString(),
      name: cat.name,
      slug: cat.slug,
    }));

    console.log('[getHomepageData] Data processed successfully');

    return {
      professionals: processedProfessionals,
      categories: processedCategories,
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

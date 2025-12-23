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
    console.log('[getHomepageData] Starting...');
    
    // Return empty data immediately with timeout protection
    const timeoutPromise = new Promise<HomepageData>((resolve) => {
      setTimeout(() => {
        console.log('[getHomepageData] Timeout reached, returning empty data');
        resolve({
          professionals: [],
          categories: [],
          newsFlashes: [],
        });
      }, 5000); // 5 second timeout
    });

    const dataPromise = (async () => {
      try {
        // Connect to database
        console.log('[getHomepageData] Connecting to DB...');
        await connectDBWithTimeout();
        console.log('[getHomepageData] DB connected');

        // Fetch professionals
        console.log('[getHomepageData] Fetching professionals...');
        const professionals = await ProfessionalModel.find({ active: true })
          .populate('category', 'name slug')
          .sort({ featured: -1, rating: -1 })
          .limit(4)
          .lean()
          .exec();

        console.log('[getHomepageData] Got professionals:', professionals.length);

        // Fetch categories
        console.log('[getHomepageData] Fetching categories...');
        const categories = await CategoryModel.find({})
          .sort({ name: 1 })
          .limit(7)
          .lean()
          .exec();

        console.log('[getHomepageData] Got categories:', categories.length);

        // Process data
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

        return {
          professionals: processedProfessionals,
          categories: processedCategories,
          newsFlashes: [],
        };
      } catch (dbError) {
        console.error('[getHomepageData] DB Error:', dbError);
        return {
          professionals: [],
          categories: [],
          newsFlashes: [],
        };
      }
    })();

    // Race between data fetch and timeout
    return Promise.race([dataPromise, timeoutPromise]);
  } catch (error) {
    console.error('[getHomepageData] Fatal error:', error);
    return {
      professionals: [],
      categories: [],
      newsFlashes: [],
    };
  }
}

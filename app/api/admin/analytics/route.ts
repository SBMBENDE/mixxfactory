/**
 * Admin Analytics API endpoint
 * Returns comprehensive analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { errorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return authResult.error;
    }

    await connectDB();

    // Fetch all professionals and categories
    const [professionals, categories] = await Promise.all([
      ProfessionalModel.find().populate('category').lean(),
      CategoryModel.find().lean(),
    ]);

    // Calculate key metrics
    const totalProfessionals = professionals.length;
    const activeProfessionals = professionals.filter((p) => p.active).length;
    const inactiveProfessionals = totalProfessionals - activeProfessionals;
    const totalCategories = categories.length;
    const featuredListings = professionals.filter((p) => p.featured).length;

    // Categories breakdown
    const categoriesBreakdown = categories.map((category) => {
      const profInCategory = professionals.filter((p) => {
        // Handle case where category might not be populated or might be null
        if (!p.category) return false;
        const catId = typeof p.category === 'object' ? p.category._id : p.category;
        return catId.toString() === category._id.toString();
      });
      return {
        name: category.name,
        count: profInCategory.length,
        featured: profInCategory.filter((p) => p.featured).length,
        active: profInCategory.filter((p) => p.active).length,
      };
    });

    // Professionals by rating
    const professionalsByRating = [
      { rating: 5, count: professionals.filter((p) => p.rating === 5).length },
      { rating: 4, count: professionals.filter((p) => p.rating === 4).length },
      { rating: 3, count: professionals.filter((p) => p.rating === 3).length },
      { rating: 2, count: professionals.filter((p) => p.rating === 2).length },
      { rating: 1, count: professionals.filter((p) => p.rating === 1).length },
      { rating: 0, count: professionals.filter((p) => p.rating === 0).length },
    ];

    // Recently added professionals (last 10)
    const recentProfessionals = professionals
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        category: p.category?.name || 'Unknown',
        createdAt: p.createdAt,
        active: p.active,
        featured: p.featured,
      }));

    return NextResponse.json({
      success: true,
      data: {
        totalProfessionals,
        activeProfessionals,
        inactiveProfessionals,
        totalCategories,
        featuredListings,
        categoriesBreakdown,
        professionalsByRating,
        recentProfessionals,
      },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error details:', errorMsg);
    return errorResponse(`Failed to fetch analytics: ${errorMsg}`, 500);
  }
}

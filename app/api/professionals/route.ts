/**
 * Get professionals API route with filtering
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';
import { searchQuerySchema } from '@/lib/validations';
import { successResponse, validationErrorResponse } from '@/utils/api-response';

// Cache for 30 minutes (1800 seconds) when no search/filter params
// Professionals list changes less frequently than you'd think
export const revalidate = 1800;

export async function GET(request: NextRequest) {
  try {
    await connectDBWithTimeout();

    const searchParams = request.nextUrl.searchParams;
    const query = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      slug: searchParams.get('slug') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      sort: (searchParams.get('sort') as any) || 'newest',
    };

    // Validate query parameters
    const validationResult = searchQuerySchema.safeParse(query);
    if (!validationResult.success) {
      console.error('[API] Validation error:', validationResult.error.errors);
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { q, category, slug, page, limit, sort } = validationResult.data;

    // Build MongoDB filter
    // If querying by slug (for edit), allow inactive profiles
    // Otherwise filter by active: true
    const filter: any = slug ? {} : { active: true };

    if (slug) {
      filter.slug = slug;
    }

    if (q) {
      filter.$text = { $search: q };
    }

    if (category) {
      const categoryDoc = await CategoryModel.findOne({ slug: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return successResponse(
          {
            data: [],
            total: 0,
            page,
            pageSize: limit,
            totalPages: 0,
          },
          'No results found'
        );
      }
    }

    // Build sort - featured first, then by selected sort
    const sortMap: any = {
      newest: { featured: -1, createdAt: -1 },
      rating: { featured: -1, rating: -1, reviewCount: -1 },
      name: { featured: -1, name: 1 },
    };

    const skip = (page - 1) * limit;

    // Fetch data
    const [professionals, total] = await Promise.all([
      ProfessionalModel.find(filter)
        .populate('category', 'name slug')
        .sort(sortMap[sort])
        .skip(skip)
        .limit(limit)
        .lean(),
      ProfessionalModel.countDocuments(filter),
    ]);

    // Convert ObjectIds to strings for frontend compatibility
    const processedProfessionals = professionals.map((prof: any) => ({
      ...prof,
      _id: prof._id?.toString(),
      userId: prof.userId?.toString(),
      category: {
        ...prof.category,
        _id: prof.category?._id?.toString(),
      },
    }));

    const totalPages = Math.ceil(total / limit);

    // Debug logging
    console.log(`[API] Professionals query - Filter: ${JSON.stringify(filter)}, Sort: ${sort}, Found: ${professionals.length}, Total: ${total}`);
    if (professionals.length > 0) {
      console.log(`[API] First professional:`, {
        name: professionals[0].name,
        rating: professionals[0].rating,
        featured: professionals[0].featured,
        active: professionals[0].active,
      });
    }

    return successResponse({
      data: processedProfessionals,
      total,
      page,
      pageSize: limit,
      totalPages,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[API] Error fetching professionals:', { message: errorMessage, stack: errorStack });
    console.error('[API] Full error:', error);
    return Response.json(
      {
        success: false,
        error: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

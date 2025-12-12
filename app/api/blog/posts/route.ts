/**
 * Public Blog API endpoint
 * GET - Fetch published blog posts with filtering and search
 */

import { NextRequest } from 'next/server';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { BlogPostModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDBWithTimeout();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured') === 'true';

    // Build filter
    const filter: any = { published: true };

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (featured) {
      filter.featured = true;
    }

    // Only use text search if search query exists
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    // Fetch posts and total count
    let posts: any[] = [];
    let total = 0;

    try {
      const results = await Promise.all([
        BlogPostModel.find(filter)
          .sort({ featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        BlogPostModel.countDocuments(filter),
      ]);
      posts = results[0];
      total = results[1];
    } catch (queryError) {
      // If query fails (e.g., text index not ready), return empty results
      console.error('Blog query error:', queryError);
      posts = [];
      total = 0;
    }

    // Get all categories and tags for filtering
    let allCategories: string[] = [];
    let allTags: string[] = [];

    try {
      const results = await Promise.all([
        BlogPostModel.distinct('category', { published: true }),
        BlogPostModel.distinct('tags', { published: true }),
      ]);
      allCategories = results[0] || [];
      allTags = (results[1]?.flat() || []).sort();
    } catch (err) {
      console.error('Error fetching categories/tags:', err);
      // Continue with empty arrays
    }

    // Increment views
    const postIds = posts.map((p) => p._id);
    if (postIds.length > 0) {
      try {
        await BlogPostModel.updateMany({ _id: { $in: postIds } }, { $inc: { views: 1 } });
      } catch (err) {
        console.error('Error incrementing views:', err);
        // Continue anyway
      }
    }

    return successResponse(
      {
        posts: posts.map((p) => ({
          _id: p._id.toString(),
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          category: p.category,
          tags: p.tags,
          author: p.author,
          featuredImage: p.featuredImage,
          featured: p.featured,
          views: p.views,
          createdAt: p.createdAt,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
        availableCategories: allCategories,
        availableTags: allTags,
      },
      'Posts fetched successfully',
      200
    );
  } catch (error) {
    console.error('Blog GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch posts: ${errorMsg}`, 500);
  }
}

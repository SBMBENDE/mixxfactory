/**
 * Public Blog API endpoint
 * GET - Fetch published blog posts with filtering and search
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BlogPostModel } from '@/lib/db/models';
import { successResponse, errorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    // Fetch posts and total count
    const [posts, total] = await Promise.all([
      BlogPostModel.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPostModel.countDocuments(filter),
    ]);

    // Get all categories and tags for filtering
    const allCategories = await BlogPostModel.distinct('category', { published: true });
    const allTags = await BlogPostModel.distinct('tags', { published: true });

    // Increment views
    const postIds = posts.map((p) => p._id);
    if (postIds.length > 0) {
      await BlogPostModel.updateMany({ _id: { $in: postIds } }, { $inc: { views: 1 } });
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
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          categories: allCategories,
          tags: allTags.sort(),
        },
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

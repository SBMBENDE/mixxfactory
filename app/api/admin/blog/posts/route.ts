/**
 * Admin Blog Management API
 * GET - Fetch all posts (published and draft)
 * POST - Create new blog post
 * PUT - Update blog post
 * DELETE - Delete blog post
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { BlogPostModel } from '@/lib/db/models';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { createBlogPostSchema, updateBlogPostSchema } from '@/lib/validations';
import { successResponse, errorResponse, validationErrorResponse } from '@/utils/api-response';
import { generateSlug } from '@/utils/slug';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    // If slug is provided, return single post
    if (slug) {
      const post = await BlogPostModel.findOne({ slug }).lean();
      if (!post) {
        return errorResponse('Post not found', 404);
      }
      return successResponse(
        {
          post: {
            _id: post._id.toString(),
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            tags: post.tags,
            author: post.author,
            featuredImage: post.featuredImage,
            published: post.published,
            featured: post.featured,
            views: post.views,
            createdAt: post.createdAt,
          },
        },
        'Post fetched successfully',
        200
      );
    }

    // Otherwise, return list of posts with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const published = searchParams.get('published');

    const filter: any = {};
    // Only filter by published status if the parameter is explicitly provided
    if (published === 'true' || published === 'false') {
      filter.published = published === 'true';
    }

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      BlogPostModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPostModel.countDocuments(filter),
    ]);

    return successResponse(
      {
        posts: posts.map((p) => ({
          _id: p._id.toString(),
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          category: p.category,
          tags: p.tags,
          published: p.published,
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
      },
      'Posts fetched successfully',
      200
    );
  } catch (error) {
    console.error('Admin blog GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch posts: ${errorMsg}`, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const body = await request.json();

    const validationResult = createBlogPostSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { title, content, excerpt, category, tags, author, featuredImage, featured } = validationResult.data;
    let slug = generateSlug(title);

    // Check if slug already exists and make it unique
    let existingPost = await BlogPostModel.findOne({ slug });
    let counter = 1;
    while (existingPost) {
      slug = `${generateSlug(title)}-${counter}`;
      existingPost = await BlogPostModel.findOne({ slug });
      counter++;
    }

    const post = new BlogPostModel({
      title,
      slug,
      content,
      excerpt,
      category,
      tags: tags || [],
      author,
      featuredImage,
      featured: featured || false,
      published: false,
    });

    await post.save();

    return successResponse(
      {
        _id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        published: post.published,
      },
      'Blog post created successfully',
      201
    );
  } catch (error) {
    console.error('Admin blog POST error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to create post: ${errorMsg}`, 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const body = await request.json();
    const { postId, ...updateData } = body;

    if (!postId) {
      return errorResponse('Post ID is required', 400);
    }

    // For simple boolean toggles (published, featured), skip full validation
    const isSimpleToggle = Object.keys(updateData).length <= 2 && 
      (updateData.published !== undefined || updateData.featured !== undefined);

    if (!isSimpleToggle) {
      const validationResult = updateBlogPostSchema.safeParse(updateData);
      if (!validationResult.success) {
        return validationErrorResponse(validationResult.error.errors[0].message);
      }
    }

    const post = await BlogPostModel.findByIdAndUpdate(
      postId, 
      updateData,
      { new: true }
    );

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    return successResponse(post, 'Blog post updated successfully', 200);
  } catch (error) {
    console.error('Admin blog PUT error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to update post: ${errorMsg}`, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return errorResponse('Post ID is required', 400);
    }

    const post = await BlogPostModel.findByIdAndDelete(postId);

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    return successResponse(null, 'Blog post deleted successfully', 200);
  } catch (error) {
    console.error('Admin blog DELETE error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to delete post: ${errorMsg}`, 500);
  }
}

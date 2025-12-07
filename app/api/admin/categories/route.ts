/**
 * Create category API route
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { CategoryModel } from '@/lib/db/models';
import { createCategorySchema } from '@/lib/validations';
import { generateSlug } from '@/utils/slug';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { successResponse, validationErrorResponse, internalErrorResponse } from '@/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    // Verify admin auth
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    const validationResult = createCategorySchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { name, slug: customSlug, description, icon } = validationResult.data;

    // Generate slug if not provided
    const slug = customSlug || generateSlug(name);

    // Check if slug already exists
    const existingCategory = await CategoryModel.findOne({ slug });
    if (existingCategory) {
      return validationErrorResponse('Category with this slug already exists');
    }

    // Create category
    const category = new CategoryModel({
      name,
      slug,
      description,
      icon,
    });

    await category.save();

    return successResponse(category, 'Category created successfully', 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return internalErrorResponse();
  }
}

/**
 * Get all categories
 */
export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const categories = await CategoryModel.find().sort({ createdAt: -1 }).lean();

    return successResponse(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return internalErrorResponse();
  }
}

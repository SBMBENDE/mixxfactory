/**
 * Update/Delete category API route
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { CategoryModel } from '@/lib/db/models';
import { updateCategorySchema } from '@/lib/validations';
import { generateSlug } from '@/utils/slug';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    const category = await CategoryModel.findById(id).lean();

    if (!category) {
      return notFoundResponse('Category');
    }

    return successResponse(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return internalErrorResponse();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();

    const validationResult = updateCategorySchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { name, slug: customSlug, description, icon } = validationResult.data;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (customSlug) updateData.slug = generateSlug(customSlug);
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;

    const category = await CategoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return notFoundResponse('Category');
    }

    return successResponse(category, 'Category updated successfully');
  } catch (error) {
    console.error('Error updating category:', error);
    return internalErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const { id } = params;

    const category = await CategoryModel.findByIdAndDelete(id);

    if (!category) {
      return notFoundResponse('Category');
    }

    return successResponse(null, 'Category deleted successfully');
  } catch (error) {
    console.error('Error deleting category:', error);
    return internalErrorResponse();
  }
}

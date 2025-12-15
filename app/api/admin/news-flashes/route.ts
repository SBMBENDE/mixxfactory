/**
 * Admin News Flash Management API
 * GET - Fetch all news flashes
 * POST - Create new news flash
 * PUT - Update news flash
 * DELETE - Delete news flash
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { NewsFlashModel } from '@/lib/db/models';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { createNewsFlashSchema } from '@/lib/validations';
import { successResponse, errorResponse, validationErrorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;
    const [newsFlashes, total] = await Promise.all([
      NewsFlashModel.find()
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsFlashModel.countDocuments(),
    ]);

    return successResponse(
      {
        newsFlashes: newsFlashes.map((n) => ({
          _id: n._id.toString(),
          title: n.title,
          message: n.message,
          type: n.type,
          published: n.published,
          priority: n.priority,
          startDate: n.startDate,
          endDate: n.endDate,
          createdAt: n.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'News flashes fetched successfully',
      200
    );
  } catch (error) {
    console.error('Admin news flash GET error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to fetch news flashes: ${errorMsg}`, 500);
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

    const validationResult = createNewsFlashSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    const { title, message, type, priority, startDate, endDate } = validationResult.data;

    const newsFlash = new NewsFlashModel({
      title,
      message,
      type: type || 'info',
      priority: priority || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      published: false,
    });

    await newsFlash.save();

    return successResponse(
      {
        _id: newsFlash._id.toString(),
        title: newsFlash.title,
        published: newsFlash.published,
      },
      'News flash created successfully',
      201
    );
  } catch (error) {
    console.error('Admin news flash POST error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to create news flash: ${errorMsg}`, 500);
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
    const { id, newsFlashId, ...updateData } = body;
    
    // Support both 'id' and 'newsFlashId' for compatibility
    const idToUpdate = id || newsFlashId;

    if (!idToUpdate) {
      return errorResponse('News Flash ID is required', 400);
    }

    // Validate update data if present
    if (Object.keys(updateData).length > 0) {
      // Only allow specific fields to be updated
      const allowedFields = ['title', 'message', 'type', 'priority', 'startDate', 'endDate', 'published'];
      const updateKeys = Object.keys(updateData);
      
      for (const key of updateKeys) {
        if (!allowedFields.includes(key)) {
          return errorResponse(`Field '${key}' cannot be updated`, 400);
        }
      }

      // Validate data types if provided
      if (updateData.title && typeof updateData.title !== 'string') {
        return errorResponse('Title must be a string', 400);
      }
      if (updateData.message && typeof updateData.message !== 'string') {
        return errorResponse('Message must be a string', 400);
      }
      if (updateData.type && !['info', 'success', 'warning', 'error'].includes(updateData.type)) {
        return errorResponse('Invalid type', 400);
      }
      if (updateData.priority !== undefined && typeof updateData.priority !== 'number') {
        return errorResponse('Priority must be a number', 400);
      }
      if (updateData.published !== undefined && typeof updateData.published !== 'boolean') {
        return errorResponse('Published must be a boolean', 400);
      }
    }

    const newsFlash = await NewsFlashModel.findByIdAndUpdate(idToUpdate, updateData, {
      new: true,
    });

    if (!newsFlash) {
      return errorResponse('News flash not found', 404);
    }

    return successResponse(newsFlash, 'News flash updated successfully', 200);
  } catch (error) {
    console.error('Admin news flash PUT error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to update news flash: ${errorMsg}`, 500);
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
    const newsFlashId = searchParams.get('id');

    if (!newsFlashId) {
      return errorResponse('News Flash ID is required', 400);
    }

    const newsFlash = await NewsFlashModel.findByIdAndDelete(newsFlashId);

    if (!newsFlash) {
      return errorResponse('News flash not found', 404);
    }

    return successResponse(null, 'News flash deleted successfully', 200);
  } catch (error) {
    console.error('Admin news flash DELETE error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to delete news flash: ${errorMsg}`, 500);
  }
}

/**
 * API endpoint for managing professional images
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { ProfessionalModel } from '@/lib/db/models';
import { connectDB } from '@/lib/db/connection';
import { z } from 'zod';

// Validation schemas
const imageUploadSchema = z.object({
  images: z.array(z.string().url('Each image must be a valid URL')).min(1),
});

const deleteImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    // Verify admin
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return authResult.error;
    }

    const { id } = await params;

    // Connect to DB
    await connectDB();

    // Validate request body
    const body = await request.json();
    const validatedData = imageUploadSchema.parse(body);

    // Get professional
    const professional = await ProfessionalModel.findById(id);
    if (!professional) {
      return NextResponse.json(
        { success: false, message: 'Professional not found' },
        { status: 404 }
      );
    }

    // Add new images (avoiding duplicates)
    const existingImages = professional.images || [];
    const newImages = validatedData.images.filter((img) => !existingImages.includes(img));
    professional.images = [...existingImages, ...newImages];

    await professional.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Images added successfully',
        data: {
          professional,
          imagesAdded: newImages.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding images:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add images' },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    // Verify admin
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return authResult.error;
    }

    const { id } = await params;

    // Connect to DB
    await connectDB();

    // Validate request body
    const body = await request.json();
    const validatedData = deleteImageSchema.parse(body);

    // Get professional
    const professional = await ProfessionalModel.findById(id);
    if (!professional) {
      return NextResponse.json(
        { success: false, message: 'Professional not found' },
        { status: 404 }
      );
    }

    // Remove image
    professional.images = (professional.images || []).filter(
      (img) => img !== validatedData.imageUrl
    );

    await professional.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Image deleted successfully',
        data: { professional },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error deleting image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete image' },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    // Verify admin
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isValid) {
      return authResult.error;
    }

    const { id } = await params;

    // Connect to DB
    await connectDB();

    // Validate request body
    const body = await request.json();
    const { images } = z.object({ images: z.array(z.string()) }).parse(body);

    // Get professional
    const professional = await ProfessionalModel.findById(id);
    if (!professional) {
      return NextResponse.json(
        { success: false, message: 'Professional not found' },
        { status: 404 }
      );
    }

    // Replace all images
    professional.images = images;
    await professional.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Images reordered successfully',
        data: { professional },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error reordering images:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reorder images' },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Create Professional Profile API
 * POST - Create initial professional profile after email verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';
import { z } from 'zod';

const createProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  city: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;
    const userEmail = auth.payload.email;

    await connectDB();

    // Check if professional profile already exists
    const existingProfile = await ProfessionalModel.findOne({ userId });
    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Professional profile already exists',
          data: existingProfile,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = createProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, categoryId, city, phone } = validation.data;

    // Verify category exists
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await ProfessionalModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create professional profile
    const professional = await ProfessionalModel.create({
      userId,
      name,
      slug,
      email: userEmail,
      phone: phone || '',
      category: categoryId,
      location: {
        city: city || '',
        region: '',
        country: '',
      },
      description: '',
      images: [],
      gallery: [],
      socialLinks: {},
      verified: false,
      featured: false,
      active: true,
      subscriptionTier: 'free',
    });

    // Populate category for response
    await professional.populate('category');

    return NextResponse.json(
      {
        success: true,
        message: 'Professional profile created successfully',
        data: professional,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create Profile API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create profile',
      },
      { status: 500 }
    );
  }
}

/**
 * Create professional API route
 * - Admins can create any professional profile
 * - Professionals can create their own profile after registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
import { createProfessionalSchema } from '@/lib/validations';
import { generateSlug } from '@/utils/slug';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { verifyAuth } from '@/lib/auth/verify';
import { successResponse, validationErrorResponse, internalErrorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if admin or authenticated user
    const adminAuth = await verifyAdminAuth(request);
    let isAdmin = adminAuth.isValid;
    
    let userAuth = null;
    let userId = null;
    
    if (isAdmin) {
      // Extract userId from admin auth
      userId = adminAuth.payload?.userId;
      console.log('Admin creating professional with userId:', userId);
    } else {
      userAuth = await verifyAuth(request);
      if (!userAuth?.payload) {
        console.log('❌ Authentication failed - no user auth');
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      userId = userAuth.payload.userId;
      console.log('✅ User creating professional with userId:', userId);
    }

    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse request body:', jsonError);
      return validationErrorResponse('Invalid JSON in request body');
    }
    console.log('📝 Received body for professional creation:', JSON.stringify(body, null, 2));

    const validationResult = createProfessionalSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.errors);
      return validationErrorResponse(validationResult.error.errors[0].message);
    }
    console.log('✅ Validation passed');

    const {
      name,
      slug: customSlug,
      category,
      description,
      email,
      phone,
      website,
      location,
      images,
      featured,
      rating,
      reviewCount,
      socialLinks,
      priceRange,
    } = validationResult.data;

    const slug = customSlug || generateSlug(name);
    console.log('📛 Generated slug:', slug);

    // Check if slug already exists
    console.log('🔍 Checking if slug already exists...');
    const existingProf = await ProfessionalModel.findOne({ slug });
    if (existingProf) {
      return validationErrorResponse('Professional with this slug already exists');
    }
    console.log('✅ Slug is unique');

    const professional = new ProfessionalModel({
      userId: userId,
      name,
      slug,
      category,
      description,
      email: email || undefined,
      phone,
      website: website || undefined,
      location,
      images,
      featured: featured || false,
      active: true,
      rating: rating || 5,
      reviewCount: reviewCount || 0,
      socialLinks: socialLinks || {},
      priceRange: priceRange || {},
    });
    
    console.log('💾 Saving professional to database...');
    await professional.save();
    console.log('💾 Professional saved, populating category...');
    await professional.populate('category');
    console.log('✅ Category populated');

    console.log('✅ Professional created:', { slug: professional.slug, userId: professional.userId });

    return successResponse(professional, 'Professional created successfully', 201);
  } catch (error) {
    console.error('❌ Error creating professional:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Always return JSON response
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.isValid) {
      return auth.error;
    }

    await connectDB();

    // Get pagination params from query
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch professionals with pagination
    const professionals = await ProfessionalModel.find()
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await ProfessionalModel.countDocuments();

    return successResponse(
      {
        data: professionals,
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Professionals retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return internalErrorResponse();
  }
}

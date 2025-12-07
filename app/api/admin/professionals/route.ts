/**
 * Create professional API route
 * - Admins can create any professional profile
 * - Professionals can create their own profile after registration
 */

import { NextRequest } from 'next/server';
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
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      userId = userAuth.payload.userId;
      console.log('User creating professional with userId:', userId);
    }

    await connectDB();

    const body = await request.json();
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

    // Check if slug already exists
    const existingProf = await ProfessionalModel.findOne({ slug });
    if (existingProf) {
      return validationErrorResponse('Professional with this slug already exists');
    }

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
    
    await professional.save();
    await professional.populate('category');

    console.log('Professional created:', { slug: professional.slug, userId: professional.userId });

    return successResponse(professional, 'Professional created successfully', 201);
  } catch (error) {
    console.error('Error creating professional:', error);
    return internalErrorResponse();
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

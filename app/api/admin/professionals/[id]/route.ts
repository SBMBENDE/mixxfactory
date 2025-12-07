/**
 * Update/Delete professional API route
 */

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
import { updateProfessionalSchema } from '@/lib/validations';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { verifyAuth } from '@/lib/auth/verify';
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/utils/api-response';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Check if admin or authenticated user
    const adminAuth = await verifyAdminAuth(request);
    const isAdmin = adminAuth.isValid;
    
    if (!isAdmin) {
      const userAuth = await verifyAuth(request);
      if (!userAuth?.payload) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is the owner of this profile
      const professional = await ProfessionalModel.findOne({ slug: id });
      if (!professional) {
        return notFoundResponse('Professional');
      }
      
      if (professional.userId?.toString() !== userAuth.payload.userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const validationResult = updateProfessionalSchema.safeParse(body);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.errors[0].message);
    }

    // Admin can use ID, owner can use slug
    const query = isAdmin ? { _id: id } : { slug: id };
    
    const professional = await ProfessionalModel.findOneAndUpdate(query, body, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!professional) {
      return notFoundResponse('Professional');
    }

    return successResponse(professional, 'Professional updated successfully');
  } catch (error) {
    console.error('Error updating professional:', error);
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

    const professional = await ProfessionalModel.findByIdAndDelete(id);

    if (!professional) {
      return notFoundResponse('Professional');
    }

    return successResponse(null, 'Professional deleted successfully');
  } catch (error) {
    console.error('Error deleting professional:', error);
    return internalErrorResponse();
  }
}

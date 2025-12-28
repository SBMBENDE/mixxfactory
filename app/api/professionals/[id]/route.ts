import { z } from 'zod';
// Zod schema for update
const updateProfessionalSchema = z.object({
  featured: z.boolean().optional(),
  priority: z.number().optional(),
});
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDBWithTimeout();
    const { id } = params;
    const body = await req.json();
    const parsed = updateProfessionalSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input', details: parsed.error.errors }), { status: 400 });
    }
    const update: any = {};
    if (typeof parsed.data.featured === 'boolean') update.featured = parsed.data.featured;
    if (typeof parsed.data.priority === 'number') update.priority = parsed.data.priority;
    if (Object.keys(update).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), { status: 400 });
    }
    const professional = await ProfessionalModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!professional) {
      return notFoundResponse('Professional');
    }
    return successResponse(professional);
  } catch (error) {
    console.error('Error updating professional:', error);
    return internalErrorResponse();
  }
}
/**
 * Get single professional by ID
 */

import { connectDBWithTimeout } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
import { successResponse, notFoundResponse, internalErrorResponse } from '@/utils/api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  _: unknown,
  { params }: { params: { id: string } }
) {
  try {
    await connectDBWithTimeout();

    const { id } = params;

    const professional = await ProfessionalModel.findById(id).populate('category').lean();

    if (!professional) {
      return notFoundResponse('Professional');
    }

    return successResponse(professional);
  } catch (error) {
    console.error('Error fetching professional:', error);
    return internalErrorResponse();
  }
}

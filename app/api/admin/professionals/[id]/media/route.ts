/**
 * POST /api/admin/professionals/[id]/media - Add media URLs to professional
 * PUT /api/admin/professionals/[id]/media - Update professional media
 * DELETE /api/admin/professionals/[id]/media - Remove specific media URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
import { extractMediaFromUrl } from '@/lib/utils/mediaExtractor';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check authentication
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { media } = body;

    if (!Array.isArray(media)) {
      return NextResponse.json(
        { success: false, error: 'Media must be an array of URLs' },
        { status: 400 }
      );
    }

    // Validate all media URLs
    const validatedMedia: string[] = [];
    for (const url of media) {
      if (typeof url !== 'string') continue;
      const parsed = extractMediaFromUrl(url);
      if (parsed && parsed.type !== 'unknown') {
        validatedMedia.push(url);
      }
    }

    // Update professional with new media
    const professional = await ProfessionalModel.findByIdAndUpdate(
      params.id,
      { $push: { media: { $each: validatedMedia } } },
      { new: true }
    );

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: professional,
      message: `Added ${validatedMedia.length} video(s)`,
    });
  } catch (error: any) {
    console.error('Error adding media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add media' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check authentication
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { media } = body;

    if (!Array.isArray(media)) {
      return NextResponse.json(
        { success: false, error: 'Media must be an array of URLs' },
        { status: 400 }
      );
    }

    // Validate all media URLs
    const validatedMedia: string[] = [];
    for (const url of media) {
      if (typeof url !== 'string') continue;
      const parsed = extractMediaFromUrl(url);
      if (parsed && parsed.type !== 'unknown') {
        validatedMedia.push(url);
      }
    }

    // Replace entire media array
    const professional = await ProfessionalModel.findByIdAndUpdate(
      params.id,
      { media: validatedMedia },
      { new: true }
    );

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: professional,
      message: `Updated to ${validatedMedia.length} video(s)`,
    });
  } catch (error: any) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check authentication
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Remove specific media URL
    const professional = await ProfessionalModel.findByIdAndUpdate(
      params.id,
      { $pull: { media: url } },
      { new: true }
    );

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: professional,
      message: 'Video removed',
    });
  } catch (error: any) {
    console.error('Error removing media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove media' },
      { status: 500 }
    );
  }
}

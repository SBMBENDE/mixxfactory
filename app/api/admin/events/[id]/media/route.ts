/**
 * POST /api/admin/events/[id]/media - Add media URLs to event
 * PUT /api/admin/events/[id]/media - Update event media
 * DELETE /api/admin/events/[id]/media - Remove specific media URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel } from '@/lib/db/models';
import { extractMediaFromUrl } from '@/lib/utils/mediaExtractor';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Check authentication
    const token = req.cookies.get('token')?.value;
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

    // Update event with new media
    const event = await EventModel.findByIdAndUpdate(
      params.id,
      { $push: { media: { $each: validatedMedia } } },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
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
    const token = req.cookies.get('token')?.value;
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
    const event = await EventModel.findByIdAndUpdate(
      params.id,
      { media: validatedMedia },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
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
    const token = req.cookies.get('token')?.value;
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
    const event = await EventModel.findByIdAndUpdate(
      params.id,
      { $pull: { media: url } },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
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

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { NewsFlashModel } from '@/lib/db/models';
import { connectDB } from '@/lib/db/connection';
import { verifyAdminAuth } from '@/lib/auth/middleware';

const newsFlashSchema = z.object({
  title: z.string().min(3).max(120),
  message: z.string().min(5),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
  published: z.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  priority: z.number().int().optional(),
  link: z.string().url().optional().nullable(),
});

// GET: Get a single news flash
// GET: Get a single news flash (admin only)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminAuth(req);
  if (!auth.isValid) return auth.error;
  await connectDB();
  const news = await NewsFlashModel.findById(params.id);
  if (!news) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ news });
}

// PUT: Edit a news flash
// PUT: Edit a news flash (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminAuth(req);
  if (!auth.isValid) return auth.error;
  await connectDB();
  const body = await req.json();
  const parsed = newsFlashSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updateData = {
    ...parsed.data,
    published: parsed.data.published ?? false,
    startDate: parsed.data.startDate ?? new Date(),
    endDate: parsed.data.endDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: parsed.data.priority ?? 0,
    link: parsed.data.link ?? null,
  };
  const updated = await NewsFlashModel.findByIdAndUpdate(params.id, updateData, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ news: updated });
}

// DELETE: Delete a news flash
// DELETE: Delete a news flash (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminAuth(req);
  if (!auth.isValid) return auth.error;
  await connectDB();
  const deleted = await NewsFlashModel.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

// PATCH: Publish/unpublish
// PATCH: Publish/unpublish (admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAdminAuth(req);
  if (!auth.isValid) return auth.error;
  await connectDB();
  const { published } = await req.json();
  if (typeof published !== 'boolean') {
    return NextResponse.json({ error: 'Missing or invalid published' }, { status: 400 });
  }
  const updated = await NewsFlashModel.findByIdAndUpdate(params.id, { published }, { new: true });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ news: updated });
}

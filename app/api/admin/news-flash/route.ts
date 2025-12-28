import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { NewsFlashModel } from '@/lib/db/models';
import { connectDB } from '@/lib/db/connection';

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

// GET: List all news flashes (latest first)
export async function GET() {
  await connectDB();
  const news = await NewsFlashModel.find().sort({ createdAt: -1 }).limit(20);
  return NextResponse.json({ news });
}

// POST: Create a news flash
export async function POST(req: NextRequest) {
  await connectDB();
  let body = await req.json();
  // Fallback: if 'content' is present but 'message' is not, map it
  if (body.content && !body.message) {
    body.message = body.content;
    delete body.content;
  }
  const parsed = newsFlashSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await NewsFlashModel.create({
    ...parsed.data,
    published: parsed.data.published ?? false,
    startDate: parsed.data.startDate ?? new Date(),
    endDate: parsed.data.endDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: parsed.data.priority ?? 0,
    link: parsed.data.link ?? null,
  });
  return NextResponse.json({ news: created });
}

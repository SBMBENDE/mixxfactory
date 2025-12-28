import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EventModel } from '@/lib/db/models';
import { connectDB } from '@/lib/db/connection';

const eventSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z.string().min(3).max(120),
  description: z.string().min(10),
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional(),
    venue: z.string().min(2),
    address: z.string().optional(),
  }),
  posterImage: z.string().url(),
  bannerImage: z.string().url().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    order: z.number().int().optional(),
  })).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
  category: z.string(),
  ticketing: z.array(z.object({
    label: z.string(),
    price: z.number().min(0),
    currency: z.string(),
    quantity: z.number().int().optional(),
  })),
  ticketUrl: z.string().url().optional(),
  capacity: z.number().int().min(1),
  organizer: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
  }),
  highlights: z.array(z.string()).optional(),
  media: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  promotionTier: z.string().optional(),
  promotionStartDate: z.coerce.date().optional(),
  promotionExpiryDate: z.coerce.date().optional(),
});

// GET: List all events (latest first)
export async function GET(req: NextRequest) {
  await connectDB();
  const events = await EventModel.find().sort({ createdAt: -1 }).limit(20);
  return NextResponse.json({ events });
}

// POST: Create an event
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await EventModel.create({
    ...parsed.data,
    published: parsed.data.published ?? false,
    featured: parsed.data.featured ?? false,
    promotionTier: parsed.data.promotionTier ?? 'free',
    promotionStartDate: parsed.data.promotionStartDate ?? new Date(),
    promotionExpiryDate: parsed.data.promotionExpiryDate ?? null,
  });
  return NextResponse.json({ event: created });
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
import { verifyAdminAuth } from '@/lib/auth/middleware';

type Params = { params: Promise<{ id: string }> };

// GET: Return current availability map for a professional
export async function GET(req: NextRequest, { params }: Params) {
  const auth = await verifyAdminAuth(req);
  if (!auth.isValid) return auth.error;
  await connectDB();

  const { id } = await params;
  const pro = await ProfessionalModel.findById(id).select('availability name').lean();
  if (!pro) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Convert Map to plain object for JSON serialization
  const availability = pro.availability instanceof Map
    ? Object.fromEntries(pro.availability)
    : (pro.availability as Record<string, boolean> | null) ?? {};

  return NextResponse.json({ name: pro.name, availability });
}

// PATCH: Toggle a single date or clear all
// Body: { date: "YYYY-MM-DD", available: true|false|null }  — null removes the entry
// Body: { clear: true }  — wipes entire availability map
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await verifyAdminAuth(req);
  if (!auth.isValid) return auth.error;
  await connectDB();

  const { id } = await params;
  const body = await req.json();

  const pro = await ProfessionalModel.findById(id);
  if (!pro) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.clear === true) {
    pro.availability = {} as Record<string, boolean>;
    pro.markModified('availability');
  } else if (body.date) {
    const current: Record<string, boolean> = (pro.availability instanceof Map)
      ? Object.fromEntries(pro.availability)
      : { ...(pro.availability ?? {}) };

    if (body.available === null || body.available === undefined) {
      delete current[body.date];
    } else {
      current[body.date] = Boolean(body.available);
    }
    pro.availability = current;
  } else {
    return NextResponse.json({ error: 'Provide date+available or clear:true' }, { status: 400 });
  }

  pro.markModified('availability'); // Ensure Mongoose detects Map mutation
  await pro.save();

  const availability = pro.availability instanceof Map
    ? Object.fromEntries(pro.availability)
    : (pro.availability as Record<string, boolean> | null) ?? {};

  return NextResponse.json({ availability });
}

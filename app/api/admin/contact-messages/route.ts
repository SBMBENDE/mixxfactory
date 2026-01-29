import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ContactModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  // Only allow admin users (JWT-based)
  const user = await verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const messages = await ContactModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, messages });
}

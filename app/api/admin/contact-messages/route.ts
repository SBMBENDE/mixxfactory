import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ContactModel } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Only allow admin users
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const messages = await ContactModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, messages });
}


export async function DELETE(request: NextRequest) {
  const user = await verifyAuth(request);
  if (!user || user.payload.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'No message IDs provided' }, { status: 400 });
    }
    await connectDB();
    const result = await ContactModel.deleteMany({ _id: { $in: ids } });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to delete messages', error: error.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ContactModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  // Only allow admin users (JWT-based)
  const user = await verifyAuth(request);
  if (!user || user.payload.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const messages = await ContactModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, messages });
}

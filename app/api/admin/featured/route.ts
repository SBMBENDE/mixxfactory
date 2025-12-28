
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { EventModel, ProfessionalModel } from '@/lib/db/models';

export async function GET(_: NextRequest) {
  await connectDB();
  // Auto-unfeature expired items
  await Promise.all([
    EventModel.updateMany({ featured: true, featuredUntil: { $lt: new Date() } }, { featured: false }),
    ProfessionalModel.updateMany({ featured: true, featuredUntil: { $lt: new Date() } }, { featured: false })
  ]);

  // Fetch featured items with analytics and ordering
  const events = await EventModel.find({ featured: true })
    .sort({ priority: -1, featuredSince: -1 })
    .lean();
  const professionals = await ProfessionalModel.find({ featured: true })
    .sort({ priority: -1, featuredSince: -1 })
    .lean();

  // Mock analytics if missing
  const addAnalytics = (item: any) => ({
    ...item,
    featuredViews: item.featuredViews ?? Math.floor(Math.random() * 1000),
    featuredClicks: item.featuredClicks ?? Math.floor(Math.random() * 100),
    featuredBookings: item.featuredBookings ?? Math.floor(Math.random() * 10),
  });

  return NextResponse.json({
    events: events.map(addAnalytics),
    professionals: professionals.map(addAnalytics),
    auditLog: [] // TODO: implement audit log
  });
}

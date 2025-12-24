/**
 * Professional Analytics API
 * GET - Fetch detailed analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel, AnalyticsModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    await connectDB();

    const professional = await ProfessionalModel.findOne({ userId });
    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily analytics
    const dailyAnalytics = await AnalyticsModel.find({
      professionalId: professional._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Aggregate totals
    const totalViews = dailyAnalytics.reduce((sum, day) => sum + day.views, 0);
    const totalClicks = dailyAnalytics.reduce((sum, day) => sum + day.contactClicks, 0);
    const totalImpressions = dailyAnalytics.reduce((sum, day) => sum + day.searchImpressions, 0);

    // Calculate this month vs last month
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthData = await AnalyticsModel.find({
      professionalId: professional._id,
      date: { $gte: firstDayThisMonth },
    });

    const lastMonthData = await AnalyticsModel.find({
      professionalId: professional._id,
      date: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
    });

    const thisMonthViews = thisMonthData.reduce((sum, day) => sum + day.views, 0);
    const lastMonthViews = lastMonthData.reduce((sum, day) => sum + day.views, 0);

    // Get top search terms
    const allSearchTerms: { [key: string]: number } = {};
    dailyAnalytics.forEach((day) => {
      day.searchTerms.forEach((term) => {
        allSearchTerms[term] = (allSearchTerms[term] || 0) + 1;
      });
    });

    const topSearchTerms = Object.entries(allSearchTerms)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));

    // Get top referrers
    const allReferrers: { [key: string]: number } = {};
    dailyAnalytics.forEach((day) => {
      day.referrers.forEach((ref) => {
        allReferrers[ref] = (allReferrers[ref] || 0) + 1;
      });
    });

    const topReferrers = Object.entries(allReferrers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    const analyticsData = {
      summary: {
        totalViews,
        thisMonth: thisMonthViews,
        lastMonth: lastMonthViews,
        contactClicks: totalClicks,
        searchImpressions: totalImpressions,
      },
      daily: dailyAnalytics.map((day) => ({
        date: day.date.toISOString().split('T')[0],
        views: day.views,
        clicks: day.contactClicks,
      })),
      topSearchTerms,
      topReferrers,
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load analytics',
      },
      { status: 500 }
    );
  }
}

/**
 * Payment history API route
 * GET /api/payment/history
 * Returns user's payment history
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import PaymentModel from '@/lib/db/payment-model';
import { verifyAuth } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch user's payments sorted by most recent
    const payments = await PaymentModel.find({ userId: authResult.userId })
      .sort({ createdAt: -1 })
      .select('-__v -providerPaymentId -metadata')
      .lean();

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error('[Payment History] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}

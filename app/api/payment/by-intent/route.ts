/**
 * Get Payment by Intent ID API
 * GET /api/payment/by-intent?intentId=xxx
 * Retrieves payment record by provider payment intent ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import PaymentModel from '@/lib/db/payment-model';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const intentId = searchParams.get('intentId');

    if (!intentId) {
      return NextResponse.json(
        { success: false, error: 'Intent ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find payment by provider payment ID
    const payment = await PaymentModel.findOne({ 
      providerPaymentId: intentId 
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error('[Payment API] Error fetching payment by intent:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

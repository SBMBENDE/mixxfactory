/**
 * SOS Help API Endpoint
 * Handles urgent support requests from professionals
 * Sends to admin with proper tagging and prioritization
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
import { verifyAuth } from '@/lib/auth/verify';
import { z } from 'zod';

// Validation schema
const sosHelpSchema = z.object({
  reason: z.enum([
    'account-access',
    'payment-issue',
    'profile-blocked',
    'booking-calendar',
    'other-urgent',
  ]),
  message: z.string()
    .min(20, 'Please provide at least 20 characters')
    .max(800, 'Message is too long (max 800 characters)'),
});

/**
 * POST /api/professional/sos-help
 * Submit urgent support request
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(req);
    if (!auth?.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = auth.payload.userId;

    await connectDB();

    // Find professional profile
    const professional = await ProfessionalModel.findOne({ 
      userId 
    })
      .select('name email subscriptionTier _id')
      .lean()
      .exec();

    if (!professional) {
      return NextResponse.json(
        { success: false, error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = sosHelpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { reason, message } = validationResult.data;

    // Map reason codes to readable labels
    const reasonLabels: Record<string, string> = {
      'account-access': 'Account Access Issue',
      'payment-issue': 'Payment or Subscription Issue',
      'profile-blocked': 'Profile Not Visible / Blocked',
      'booking-calendar': 'Booking or Calendar Issue',
      'other-urgent': 'Other Urgent Issue',
    };

    // Prepare email content
    const tier = (professional.subscriptionTier || 'free').toUpperCase();
    const priority = tier === 'PRO' ? 'HIGH' : 'NORMAL';
    const emailSubject = `[SOS] ${tier} user – ${reasonLabels[reason]}`;
    
    const emailBody = `
SOS SUPPORT REQUEST

Priority: ${priority}
Tier: ${tier}
Response Time: ${tier === 'PRO' ? '24 hours' : '48 hours'}

---

PROFESSIONAL DETAILS:
Name: ${professional.name}
Email: ${professional.email}
Account ID: ${professional._id}
Subscription: ${tier}

---

ISSUE CATEGORY:
${reasonLabels[reason]}

---

MESSAGE:
${message}

---

Submitted: ${new Date().toLocaleString('en-US', { 
  timeZone: 'UTC',
  dateStyle: 'full',
  timeStyle: 'long'
})}
    `.trim();

    // In production, integrate with email service (SendGrid, Resend, etc.)
    // For now, log to console and save to database (optional)
    console.log('\n=== SOS HELP REQUEST ===');
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    console.log('========================\n');

    // TODO: Send actual email to admin
    // await sendEmail({
    //   to: process.env.ADMIN_SUPPORT_EMAIL,
    //   subject: emailSubject,
    //   text: emailBody,
    // });

    return NextResponse.json({
      success: true,
      message: tier === 'PRO' 
        ? 'Your request has been sent. Our team will respond within 24 hours.'
        : 'Your request has been sent. Our team will respond within 48 hours.',
    });
  } catch (error) {
    console.error('[SOS Help] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit request. Please try again.',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

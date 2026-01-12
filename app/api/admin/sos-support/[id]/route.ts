/**
 * Admin SOS Support - Individual Ticket API
 * Update specific ticket status and notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { SOSSupportModel } from '@/lib/db/models';
import { verifyAdminAuth } from '@/lib/auth/middleware';
import { sendEmail } from '@/lib/email';

/**
 * PATCH /api/admin/sos-support/[id]
 * Update ticket status and admin notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const adminPayload = await verifyAdminAuth(request);
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { status, adminNotes } = body;

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (status === 'resolved') {
      updateData.resolvedBy = adminPayload.email;
      updateData.resolvedAt = new Date();
    }

    const updatedTicket = await SOSSupportModel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).lean();

    if (!updatedTicket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Send notification email to professional
    try {
      let emailSubject = '';
      let emailBody = '';

      if (status === 'in-progress') {
        emailSubject = '✓ Your SOS Request is Being Handled';
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">We're On It! 🚀</h1>
            </div>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
              <p>Hi ${updatedTicket.professionalName},</p>
              
              <p>Good news! Our support team has started working on your SOS request.</p>
              
              <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
                <p style="margin: 0; color: #666;"><strong>Ticket Status:</strong> In Progress</p>
                <p style="margin: 5px 0 0 0; color: #666;"><strong>Priority:</strong> ${updatedTicket.priority === 'high' ? 'HIGH (24hr response)' : 'Normal (48hr response)'}</p>
              </div>
              
              <p>We'll get back to you as soon as possible. If you have any additional information that might help, feel free to submit another request.</p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Thank you for your patience!</p>
              <p style="color: #999; font-size: 12px;">- The Afrobizz Support Team</p>
            </div>
          </div>
        `;
      } else if (status === 'resolved') {
        emailSubject = '✓ Your SOS Request Has Been Resolved';
        emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Issue Resolved ✓</h1>
            </div>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
              <p>Hi ${updatedTicket.professionalName},</p>
              
              <p>Your SOS support request has been resolved by our team.</p>
              
              ${adminNotes ? `
              <div style="background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
                <p style="margin: 0; color: #666;"><strong>Resolution Notes:</strong></p>
                <p style="margin: 10px 0 0 0; color: #333;">${adminNotes}</p>
              </div>
              ` : ''}
              
              <p>If you're still experiencing issues or have any questions, please don't hesitate to submit another SOS request.</p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">We're always here to help!</p>
              <p style="color: #999; font-size: 12px;">- The Afrobizz Support Team</p>
            </div>
          </div>
        `;
      }

      if (emailSubject && updatedTicket.professionalEmail) {
        await sendEmail({
          to: updatedTicket.professionalEmail,
          subject: emailSubject,
          html: emailBody,
        });
        console.log(`[SOS Support] Notification sent to ${updatedTicket.professionalEmail} - Status: ${status}`);
      }
    } catch (emailError) {
      console.error('[SOS Support] Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      ticket: {
        ...updatedTicket,
        _id: updatedTicket._id.toString(),
        professionalId: updatedTicket.professionalId.toString(),
      },
    });
  } catch (error) {
    console.error('[Admin SOS Support] Error updating ticket:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update ticket',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Contact form submission API
 * POST /api/contact - Submit contact form
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ContactModel } from '@/lib/db/models';
import { contactSchema } from '@/lib/validations';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = contactSchema.parse(body);

    // Connect to database
    await connectDB();

    // Create and save contact submission
    const contact = new ContactModel({
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      read: false,
    });

    await contact.save();

    // Send notification email to admin
    try {
      const adminEmail = process.env.SENDGRID_FROM_EMAIL || 'mbende2000@hotmail.com';
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 20px; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .field-label { color: #667eea; font-weight: bold; font-size: 14px; }
              .field-value { background: white; padding: 10px; border-left: 3px solid #667eea; margin-top: 5px; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📬 New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="field-label">From:</div>
                  <div class="field-value">${validatedData.name}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Email:</div>
                  <div class="field-value"><a href="mailto:${validatedData.email}">${validatedData.email}</a></div>
                </div>
                
                <div class="field">
                  <div class="field-label">Subject:</div>
                  <div class="field-value">${validatedData.subject}</div>
                </div>
                
                <div class="field">
                  <div class="field-label">Message:</div>
                  <div class="field-value" style="white-space: pre-wrap;">${validatedData.message}</div>
                </div>
              </div>
              <div class="footer">
                <p>Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendEmail({
        to: adminEmail,
        subject: `New Contact Form: ${validatedData.subject}`,
        html,
      });
    } catch (emailError: any) {
      console.error('Error sending contact notification email:', emailError);
      // Don't fail the request if email notification fails
      // The contact message was already saved successfully
    }
    return NextResponse.json(
      {
        success: true,
        message: 'Contact message submitted successfully. We will get back to you soon!',
        data: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact submission error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      const formattedErrors = error.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: formattedErrors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to submit contact message. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed',
    },
    { status: 405 }
  );
}

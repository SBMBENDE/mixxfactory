/**
 * Contact form submission API
 * POST /api/contact - Submit contact form
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ContactModel } from '@/lib/db/models';
import { contactSchema } from '@/lib/validations';

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

/**
 * Debug API route - Test MongoDB connectivity
 * Helps diagnose connection issues
 */

import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test connection
    await connectDB();
    const connectTime = Date.now() - startTime;

    // Test query
    const queryStart = Date.now();
    const count = await ProfessionalModel.countDocuments();
    const queryTime = Date.now() - queryStart;

    // Get sample
    const sample = await ProfessionalModel.findOne().lean();

    return Response.json({
      status: 'ok',
      mongodb: {
        connected: true,
        connectionTime: `${connectTime}ms`,
        professionals: {
          total: count,
          queryTime: `${queryTime}ms`,
          sample: sample ? { name: sample.name, featured: sample.featured, active: sample.active } : null,
        },
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

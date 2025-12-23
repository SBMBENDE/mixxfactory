/**
 * Middleware for handling locale routing and request logging
 * Currently disabled - will be enabled after app structure is updated with [lang] segment
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Log all requests to auth endpoints for debugging
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    console.error(`[MIDDLEWARE] ${request.method} ${request.nextUrl.pathname} at ${new Date().toISOString()}`);
  }
  
  // TODO: Enable locale routing after app restructuring
  // For now, middleware is disabled to keep current routes working
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Temporarily disabled - will re-enable with [lang] segment routing
    '/((?!_next|public|api|manifest.json|favicon.ico).*)',
  ],
};

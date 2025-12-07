/**
 * Middleware for handling locale routing
 * Currently disabled - will be enabled after app structure is updated with [lang] segment
 */

import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'fr'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
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

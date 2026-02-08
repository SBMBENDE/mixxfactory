/**
 * Middleware for handling locale routing and request logging
 * Currently disabled - will be enabled after app structure is updated with [lang] segment
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isAdmin =
    req.cookies.get('afrobizz_admin')?.value === process.env.ADMIN_ACCESS_KEY;

  const { pathname } = req.nextUrl;

  // Allow Next.js internals, coming soon page & admin access page
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/coming-soon' ||
    pathname === '/admin-access'
  ) {
    return NextResponse.next();
  }

  // Redirect non-admins
  if (!isAdmin) {
    return NextResponse.redirect(new URL('/coming-soon', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!favicon.ico).*)',
};

/**
 * Proxy for handling coming soon page redirect in production
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // Skip coming soon page in local development
  // Check for localhost, local IPs, or development environment
  const hostname = req.nextUrl.hostname;
  const isDevelopment = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||  // Local network
    hostname.startsWith('10.') ||        // Local network
    hostname.startsWith('172.16.') ||    // Local network
    process.env.NODE_ENV === 'development';
    
  if (isDevelopment) {
    return NextResponse.next();
  }

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

  // Redirect non-admins to coming soon page
  if (!isAdmin) {
    return NextResponse.redirect(new URL('/coming-soon', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!favicon.ico).*)',
};

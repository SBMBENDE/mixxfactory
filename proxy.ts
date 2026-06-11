import { NextRequest, NextResponse } from 'next/server';

type RateLimitRule = {
  path: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_RULES: RateLimitRule[] = [
  { path: '/api/professionals', limit: 80, windowMs: 60_000 },
  { path: '/api/categories', limit: 80, windowMs: 60_000 },
  { path: '/api/events', limit: 60, windowMs: 60_000 },
  { path: '/api/news-flashes', limit: 60, windowMs: 60_000 },
  { path: '/api/blog/posts', limit: 60, windowMs: 60_000 },
];

const buckets = new Map<string, Bucket>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

function resolveRule(pathname: string): RateLimitRule | null {
  for (const rule of RATE_LIMIT_RULES) {
    if (pathname === rule.path || pathname.startsWith(`${rule.path}/`)) {
      return rule;
    }
  }

  return null;
}

function pruneBuckets(now: number) {
  if (buckets.size < 500) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function proxy(request: NextRequest) {
  if (process.env.RATE_LIMIT_DISABLED === 'true') {
    return NextResponse.next();
  }

  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  const rule = resolveRule(request.nextUrl.pathname);
  if (!rule) {
    return NextResponse.next();
  }

  const now = Date.now();
  pruneBuckets(now);

  const ip = getClientIp(request);
  const key = `${rule.path}:${ip}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return NextResponse.next();
  }

  if (existing.count >= rule.limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Too many requests. Please retry shortly.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(rule.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(existing.resetAt / 1000)),
        },
      }
    );
  }

  existing.count += 1;
  buckets.set(key, existing);

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(rule.limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, rule.limit - existing.count)));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(existing.resetAt / 1000)));
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
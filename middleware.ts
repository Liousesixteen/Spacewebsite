import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

/**
 * Security headers applied to all responses.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-src 'self' https://www.youtube.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Strict Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Frame options (legacy, CSP frame-ancestors is preferred)
  response.headers.set('X-Frame-Options', 'DENY');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

/**
 * Rate limiting for API routes using a simple sliding window.
 */
const apiRateMap = new Map<string, { count: number; resetAt: number }>();

function checkApiRateLimit(req: NextRequest): NextResponse | null {
  const path = req.nextUrl.pathname;

  // Only rate-limit API routes
  if (!path.startsWith('/api/')) return null;

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous';

  const windowMs = 60_000; // 1 minute window
  const maxRequests = 120; // per minute per IP
  const now = Date.now();

  let entry = apiRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    apiRateMap.set(ip, entry);
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return NextResponse.json(
      { code: 'RATE_LIMITED', message: 'Too many requests. Try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  // Add rate limit headers to be set later
  const remaining = Math.max(0, maxRequests - entry.count);
  req.headers.set('x-ratelimit-remaining', String(remaining));
  req.headers.set('x-ratelimit-reset', String(Math.ceil(entry.resetAt / 1000)));

  return null; // allowed
}

export default function middleware(req: NextRequest) {
  const isApi = req.nextUrl.pathname.startsWith('/api/');

  // API routes: only security + rate limiting, no i18n redirect
  if (isApi) {
    const rateLimitResponse = checkApiRateLimit(req);
    if (rateLimitResponse) {
      return applySecurityHeaders(rateLimitResponse);
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    return applySecurityHeaders(response);
  }

  // Page routes: rate limit + i18n
  const rateLimitResponse = checkApiRateLimit(req);
  if (rateLimitResponse) {
    return applySecurityHeaders(rateLimitResponse);
  }

  const response = intlMiddleware(req);
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ['/', '/(zh-CN|en|ru|ja)/:path*', '/api/:path*'],
};

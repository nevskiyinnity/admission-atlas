import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from '@/i18n/routing';
import { validateOrigin } from '@/lib/csrf';
import { isRateLimited } from '@/lib/rate-limit';

const intlMiddleware = createMiddleware(routing);

const publicPages = ['/login', '/forgot-password'];

const roleRouteMap: Record<string, string[]> = {
  STUDENT: ['/student'],
  COUNSELOR: ['/counselor'],
  ADMIN: ['/admin'],
};

const roleHomeMap: Record<string, string> = {
  STUDENT: '/student/dashboard',
  COUNSELOR: '/counselor/students',
  ADMIN: '/admin/dashboard',
};

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF protection for API mutation requests
  if (
    pathname.startsWith('/api') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
  ) {
    if (!validateOrigin(req)) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'CSRF validation failed: origin mismatch' },
          { status: 403 }
        )
      );
    }
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api')) {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
    const maxRequests = req.method === 'GET' ? 100 : 20;
    if (isRateLimited(ip, maxRequests)) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      );
    }
  }

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Apply intl middleware first
  const intlResponse = intlMiddleware(req);

  // Extract locale and path without locale
  const pathnameWithoutLocale = pathname.replace(/^\/(en|zh)/, '') || '/';

  // Check if public page
  const isPublicPage = publicPages.some(
    (page) => pathnameWithoutLocale === page || pathnameWithoutLocale.startsWith(page)
  );

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If on public page and already logged in, redirect to home
  if (isPublicPage && token) {
    const role = token.role as string;
    const home = roleHomeMap[role] || '/login';
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}${home}`, req.url));
  }

  // If not public page and not logged in, redirect to login
  if (!isPublicPage && !token && pathnameWithoutLocale !== '/') {
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // Root redirect
  if (pathnameWithoutLocale === '/' && token) {
    const role = token.role as string;
    const home = roleHomeMap[role] || '/login';
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}${home}`, req.url));
  }

  if (pathnameWithoutLocale === '/' && !token) {
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // Role-based route guard
  if (token) {
    const role = token.role as string;
    const allowedPrefixes = roleRouteMap[role] || [];

    const isProtectedRoute = Object.values(roleRouteMap)
      .flat()
      .some((prefix) => pathnameWithoutLocale.startsWith(prefix));

    if (isProtectedRoute) {
      const hasAccess = allowedPrefixes.some((prefix) =>
        pathnameWithoutLocale.startsWith(prefix)
      );

      if (!hasAccess) {
        const home = roleHomeMap[role] || '/login';
        const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
        return NextResponse.redirect(new URL(`/${locale}${home}`, req.url));
      }
    }
  }

  return applySecurityHeaders(intlResponse as NextResponse);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',],
};

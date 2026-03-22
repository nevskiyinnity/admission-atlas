import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { validateOrigin } from '@/lib/csrf';
import { isRateLimited } from '@/lib/rate-limit';

const intlMiddleware = createIntlMiddleware(routing);

const publicPages = ['/', '/about', '/college-admissions', '/counselors', '/results', '/contact', '/neural-engine', '/login', '/forgot-password'];

const authOnlyPages = ['/login', '/forgot-password'];

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

const isPublicRoute = createRouteMatcher([
  '/(en|zh)',
  '/(en|zh)/(about|college-admissions|counselors|results|contact|neural-engine)(.*)',
  '/(en|zh)/login(.*)',
  '/(en|zh)/forgot-password(.*)',
  '/api/webhooks/(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
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
    if (await isRateLimited(ip, maxRequests)) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      );
    }
  }

  // Skip API routes and static files for intl/auth page logic
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Bare root without locale prefix → redirect to /en (landing page)
  console.log('[MW] pathname:', pathname, 'full url:', req.url);
  if (pathname === '/') {
    console.log('[MW] Redirecting / to /en');
    return applySecurityHeaders(
      NextResponse.redirect(new URL('/en', req.url))
    );
  }

  // Apply intl middleware first
  const intlResponse = intlMiddleware(req);

  // Extract locale and path without locale
  const pathnameWithoutLocale = pathname.replace(/^\/(en|zh)/, '') || '/';

  // Redirect legacy /team to /counselors
  if (pathnameWithoutLocale === '/team' || pathnameWithoutLocale.startsWith('/team/')) {
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
    return applySecurityHeaders(
      NextResponse.redirect(new URL(`/${locale}/counselors`, req.url), 301)
    );
  }

  // Check if public page (exact match for /, startsWith for others like /login/sso-callback)
  const isPublicPage = publicPages.some(
    (page) =>
      pathnameWithoutLocale === page ||
      (page !== '/' && pathnameWithoutLocale.startsWith(page))
  );

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as Record<string, unknown>)?.role as string | undefined;

  // Authenticated user on auth-only page (login, forgot-password) → redirect to dashboard
  const isAuthOnlyPage = authOnlyPages.some(
    (page) => pathnameWithoutLocale === page || pathnameWithoutLocale.startsWith(page)
  );
  if (isAuthOnlyPage && userId) {
    const home = roleHomeMap[role || ''] || '/login';
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}${home}`, req.url));
  }

  // Unauthenticated user on protected page → redirect to login
  if (!isPublicPage && !userId) {
    const locale = pathname.match(/^\/(en|zh)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // Role-based route guard
  if (userId && role) {
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
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

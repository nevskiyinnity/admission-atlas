import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from '@/i18n/routing';

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

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
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

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};

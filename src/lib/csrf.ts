import { NextRequest } from 'next/server';

/**
 * Validates that the Origin header of a request matches the Host header.
 * This prevents cross-site request forgery by ensuring mutation requests
 * originate from the same domain.
 *
 * Returns true if the request is safe (same origin or non-browser request).
 * Returns false if there is an origin mismatch (potential CSRF).
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // Allow non-browser requests (curl, Postman, etc.) that don't send Origin
  if (!origin || !host) return true;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

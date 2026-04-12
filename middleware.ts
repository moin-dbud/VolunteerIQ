import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes only coordinators can access
const COORDINATOR_ONLY = ['/dashboard', '/ai-insights', '/map', '/settings/coordinator'];
// Routes only volunteers can access
const VOLUNTEER_ONLY = ['/settings/volunteer'];
// Public routes — no auth required
const PUBLIC = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root route: show landing page for guests, redirect logged-in users to dashboard
  if (pathname === '/') {
    const uid = request.cookies.get('viq_uid')?.value;
    const role = request.cookies.get('viq_role')?.value;
    if (uid && role) {
      return NextResponse.redirect(
        new URL(role === 'coordinator' ? '/dashboard' : '/volunteer', request.url)
      );
    }
    return NextResponse.next(); // Show landing page
  }

  // Always allow public routes and internal Next.js/_next paths
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const uid = request.cookies.get('viq_uid')?.value;
  const role = request.cookies.get('viq_role')?.value;

  // Unauthenticated → redirect to login
  if (!uid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Volunteer trying to reach coordinator-only page
  if (role === 'volunteer' && COORDINATOR_ONLY.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/volunteer', request.url));
  }

  // Coordinator trying to reach volunteer-only page
  if (role === 'coordinator' && VOLUNTEER_ONLY.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|leaflet|api|.*\\.png|.*\\.svg|.*\\.ico).*)',
  ],
};

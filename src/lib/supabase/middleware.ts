import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Updates the Supabase session in middleware.
 * This ensures auth state is refreshed on each request.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add code between createServerClient and supabase.auth.getUser()
  // A simple mistake could make your app vulnerable to security issues.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/properties',
    '/buyers',
    '/pipeline',
    '/settings',
    '/onboarding',
    '/api/user',
    '/api/team',
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Define auth routes (login, signup) - redirect to dashboard if already authenticated
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  // Auth callback and reset-password should be accessible
  const authCallbackRoutes = ['/auth/callback', '/auth/reset-password'];
  const isAuthCallback = authCallbackRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!user && isProtectedRoute) {
    // User is not authenticated and trying to access protected route
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute && !isAuthCallback) {
    // User is authenticated and trying to access auth routes (but not callbacks)
    // Redirect to /properties (new default landing)
    const url = request.nextUrl.clone();
    url.pathname = '/properties';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

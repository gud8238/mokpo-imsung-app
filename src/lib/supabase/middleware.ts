import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Role-based routing (only query profiles once)
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/student') ||
    request.nextUrl.pathname.startsWith('/teacher')
  )) {
    // Determine role from email pattern to avoid RLS issues in middleware
    const isTeacher = user.email?.startsWith('teacher') ?? false;

    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone();
      url.pathname = isTeacher ? '/teacher' : '/student/books';
      return NextResponse.redirect(url);
    }

    if (!isTeacher && request.nextUrl.pathname.startsWith('/teacher')) {
      const url = request.nextUrl.clone();
      url.pathname = '/student/books';
      return NextResponse.redirect(url);
    }

    if (isTeacher && request.nextUrl.pathname.startsWith('/student')) {
      const url = request.nextUrl.clone();
      url.pathname = '/teacher';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
const publicPaths = ['/login', '/auth/callback'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1];
  const isPublicPath = publicPaths.some(path => pathname.includes(`/${locale}${path}`));
  
  if (isPublicPath) {
    return NextResponse.next();
  }
    
  if (
    !user &&
    !isPublicPath
  ) {
    // no user, redirect to the login page while preserving all search parameters
    const url = new URL(`/${locale}/login`, request.url);
    // Copy all existing search parameters from the original request
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(url);
  }
  
  return supabaseResponse
}
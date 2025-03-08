import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

// Define locales directly in middleware to avoid import issues
const locales = ['en', 'zh'] as const;

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'zh',
  localePrefix: 'as-needed'
});

export async function middleware(request: NextRequest) {
  // First, handle internationalization
  const intlResponse = intlMiddleware(request);
  
  // Create a response object based on the intl middleware response
  let response = NextResponse.next({
    request: {
      headers: intlResponse.headers,
    },
  });

  // Ensure URL is properly formatted
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Skip auth check if environment variables are not set
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are not set');
    return intlResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const pathname = request.nextUrl.pathname;
    const locale = pathname.split('/')[1];
    const isLocaleInPath = (locales as readonly string[]).includes(locale);
    const pathnameWithoutLocale = isLocaleInPath ? pathname.replace(`/${locale}`, '') : pathname;

    // If user is not signed in and the current path is not /login,
    // redirect the user to /login
    if (!session && 
        !pathnameWithoutLocale.startsWith('/login') && 
        !pathnameWithoutLocale.startsWith('/auth')) {
      const redirectUrl = new URL(
        isLocaleInPath ? `/${locale}/login` : '/login', 
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // If user is signed in and the current path is /login,
    // redirect the user to /
    if (session && pathnameWithoutLocale.startsWith('/login')) {
      const redirectUrl = new URL(
        isLocaleInPath ? `/${locale}` : '/', 
        request.url
      );
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Auth error in middleware:', error);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
}; 
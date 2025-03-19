import { NextRequest, NextResponse } from 'next/server';
import { locales } from './config';
import { updateSession } from '@/app/lib/supabase/middleware'

// Define public paths that don't require authentication
const publicPaths = ['/login', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // If the pathname doesn't have a locale, redirect to the default locale
  if (!pathnameHasLocale) {
    // Get the locale from the Accept-Language header or use 'zh' as default
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLocale = acceptLanguage.includes('zh-CN') ? 'zh' : 'en';
    
    // Create the URL with the preferred locale
    const url = new URL(`/${preferredLocale}${pathname}`, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }
  
  // Get the locale from the pathname
  const locale = pathname.split('/')[1];
  // Check if the path is public (login, auth callback, etc.)
  const isPublicPath = publicPaths.some(path => pathname.includes(`/${locale}${path}`));
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // User is logged in, allow access
  return await updateSession(request)

}

// Only run the middleware on these paths
export const config = {
  matcher: [
    // Match all paths except static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 
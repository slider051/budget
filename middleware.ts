import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { protectApiRequest } from "@/lib/security/apiProtection";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes, auth callbacks: skip i18n, apply security + session only
  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    const protectedResponse = protectApiRequest(request);
    if (protectedResponse) {
      return protectedResponse;
    }
    return updateSession(request);
  }

  // All other routes: apply security check first
  const protectedResponse = protectApiRequest(request);
  if (protectedResponse) {
    return protectedResponse;
  }

  // Apply Supabase session check (handles auth redirects for locale-prefixed paths)
  const sessionResponse = await updateSession(request);

  // If updateSession returned a redirect (not logged in → /login), use that
  if (sessionResponse.status === 307 || sessionResponse.status === 308) {
    return sessionResponse;
  }

  // Apply i18n routing (handles locale prefix redirect/rewrite)
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

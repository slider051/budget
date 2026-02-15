import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "./env";

const PUBLIC_PATHS = ["/login", "/auth/callback"];
const AUTH_BYPASS_PATHS = ["/api/cron"];

/** Strip locale prefix (e.g. "/ko/login" → "/login") */
function stripLocalePrefix(pathname: string): string {
  const localePattern = /^\/(ko|en)(\/|$)/;
  const match = pathname.match(localePattern);
  if (match) {
    const rest = pathname.slice(match[0].length - (match[2] === "/" ? 1 : 0));
    return rest || "/";
  }
  return pathname;
}

function isPublicPath(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  return PUBLIC_PATHS.some(
    (publicPath) =>
      stripped === publicPath || stripped.startsWith(`${publicPath}/`),
  );
}

function getSafeNext(pathname: string, search: string): string {
  const nextPath = `${pathname}${search}`;
  return nextPath.startsWith("/") ? nextPath : "/";
}

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({
      request,
    });
  }

  const { pathname, search } = request.nextUrl;
  const shouldBypassAuth = AUTH_BYPASS_PATHS.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`),
  );

  if (shouldBypassAuth) {
    return NextResponse.next({
      request,
    });
  }

  let response = NextResponse.next({
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
            request.cookies.set(name, value),
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = isPublicPath(pathname);

  const strippedPathname = stripLocalePrefix(pathname);

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", getSafeNext(pathname, search));
    return NextResponse.redirect(loginUrl);
  }

  if (user && strippedPathname === "/login") {
    const next = request.nextUrl.searchParams.get("next");
    const safeNext = next && next.startsWith("/") ? next : "/";
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  return response;
}

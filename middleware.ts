import type { NextRequest } from "next/server";
import { protectApiRequest } from "@/lib/security/apiProtection";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const protectedResponse = protectApiRequest(request);
  if (protectedResponse) {
    return protectedResponse;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

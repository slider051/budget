import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(nextValue: string | null): string {
  if (!nextValue) return "/";
  return nextValue.startsWith("/") ? nextValue : "/";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeNext(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}

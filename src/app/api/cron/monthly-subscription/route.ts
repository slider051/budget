import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getKstYearMonth } from "@/lib/time/kst";

interface GenerationResultRow {
  readonly result_year_month: string;
  readonly created_count: number;
  readonly skipped_count: number;
  readonly total_count: number;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createClient(url, serviceRoleKey);
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${expected}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const yearMonth =
    requestUrl.searchParams.get("yearMonth") ?? getKstYearMonth();

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) {
    return NextResponse.json(
      { error: "Invalid yearMonth. Use YYYY-MM." },
      { status: 400 },
    );
  }

  try {
    const supabase = getAdminClient();
    const { data: users, error: usersError } = await supabase
      .from("subscriptions")
      .select("user_id");

    if (usersError) {
      throw new Error(usersError.message);
    }

    const userIds = Array.from(
      new Set(
        (users ?? [])
          .map((item) => item.user_id as string | null)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    let created = 0;
    let skipped = 0;
    let total = 0;

    for (const userId of userIds) {
      const { data, error } = await supabase.rpc(
        "run_monthly_subscription_generation",
        {
          p_user_id: userId,
          p_year_month: yearMonth,
        },
      );

      if (error) {
        throw new Error(`RPC failed for user ${userId}: ${error.message}`);
      }

      const row = (data as GenerationResultRow[] | null)?.[0];
      if (!row) continue;

      created += Number(row.created_count ?? 0);
      skipped += Number(row.skipped_count ?? 0);
      total += Number(row.total_count ?? 0);
    }

    return NextResponse.json({
      ok: true,
      yearMonth,
      users: userIds.length,
      created,
      skipped,
      total,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/monthly-subscription] failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOpsAlert } from "@/lib/alerts/opsAlert";
import {
  ApiRouteError,
  buildApiErrorBody,
  mapToApiRouteError,
} from "@/lib/api/errors";
import { parseYearMonthForApi } from "@/lib/api/validators";
import { getKstYearMonth } from "@/lib/time/kst";

interface GenerationResultRow {
  readonly result_year_month: string;
  readonly created_count: number;
  readonly skipped_count: number;
  readonly total_count: number;
}

interface CronContext {
  readonly trigger: "vercel-cron" | "manual-or-other";
  readonly requestId: string;
  readonly ua: string;
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

function buildCronContext(request: Request): CronContext {
  const ua = request.headers.get("user-agent") ?? "unknown";
  const trigger = ua.includes("vercel-cron")
    ? "vercel-cron"
    : "manual-or-other";
  const requestId = request.headers.get("x-vercel-id") ?? crypto.randomUUID();

  return { trigger, requestId, ua };
}

export async function GET(request: Request) {
  const context = buildCronContext(request);

  if (!isAuthorized(request)) {
    console.warn("[cron/monthly-subscription] unauthorized", context);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestUrl = new URL(request.url);
  const requestedYearMonth = requestUrl.searchParams.get("yearMonth");
  let yearMonth = requestedYearMonth ?? getKstYearMonth();

  try {
    yearMonth = parseYearMonthForApi(requestedYearMonth, yearMonth);

    console.info("[cron/monthly-subscription] started", {
      ...context,
      yearMonth,
      timestamp: new Date().toISOString(),
    });

    const supabase = getAdminClient();
    const { data: users, error: usersError } = await supabase
      .from("subscriptions")
      .select("user_id");

    if (usersError) {
      throw usersError;
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
        throw new ApiRouteError({
          status: 500,
          code: "DATABASE_ERROR",
          userMessage: "Batch execution failed.",
          logMessage: `RPC failed for user ${userId}: ${error.message}`,
          details: {
            userId,
            dbCode: error.code ?? "unknown",
            hint: error.hint ?? null,
            details: error.details ?? null,
          },
        });
      }

      const row = (data as GenerationResultRow[] | null)?.[0];
      if (!row) continue;

      created += Number(row.created_count ?? 0);
      skipped += Number(row.skipped_count ?? 0);
      total += Number(row.total_count ?? 0);
    }

    const responseBody = {
      ok: true,
      yearMonth,
      users: userIds.length,
      created,
      skipped,
      total,
      timestamp: new Date().toISOString(),
      trigger: context.trigger,
      requestId: context.requestId,
    };

    console.info("[cron/monthly-subscription] completed", responseBody);

    return NextResponse.json(responseBody);
  } catch (error) {
    const mapped = mapToApiRouteError(error);

    console.error("[cron/monthly-subscription] failed", {
      ...context,
      yearMonth,
      status: mapped.status,
      code: mapped.code,
      error: mapped.logMessage,
      details: mapped.details ?? null,
      timestamp: new Date().toISOString(),
    });

    await sendOpsAlert({
      severity: "critical",
      source: "cron/monthly-subscription",
      message: "monthly subscription batch failed",
      details: {
        trigger: context.trigger,
        requestId: context.requestId,
        yearMonth,
        status: mapped.status,
        code: mapped.code,
        error: mapped.logMessage,
      },
    });

    return NextResponse.json(buildApiErrorBody(mapped), {
      status: mapped.status,
    });
  }
}

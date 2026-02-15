import { NextResponse } from "next/server";
import {
  buildAnnualAnalysisPayload,
  parseAnalysisYear,
  parseAnnualAnalysisPayload,
} from "@/lib/analysis/annualApi";
import { createClient } from "@/lib/supabase/server";
import type { Transaction } from "@/types/budget";
import type { MonthlyBudget } from "@/types/monthlyBudget";

interface TransactionRow {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

interface MonthlyBudgetRow {
  month: string;
  categories: unknown;
  updated_at: string;
}

interface RpcErrorLike {
  code?: string;
  message: string;
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    description: row.description ?? "",
    date: row.date,
    createdAt: row.created_at,
  };
}

function toBudget(row: MonthlyBudgetRow): MonthlyBudget {
  const categories =
    row.categories && typeof row.categories === "object"
      ? Object.entries(row.categories as Record<string, unknown>).reduce<
          Record<string, number>
        >((acc, [key, raw]) => {
          const parsed = typeof raw === "number" ? raw : Number(raw);
          if (Number.isFinite(parsed)) {
            acc[key] = parsed;
          }
          return acc;
        }, {})
      : {};

  return {
    month: row.month,
    categories,
    updatedAt: row.updated_at,
  };
}

function isMissingRpcError(error: RpcErrorLike | null): boolean {
  if (!error) return false;
  return (
    error.code === "42883" ||
    error.code === "PGRST202" ||
    error.message.includes("Could not find the function") ||
    error.message.includes("get_annual_analysis_payload")
  );
}

async function loadRawAnalysisData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  year: number,
) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const yearLike = `${year}-%`;

  const [
    { data: transactionRows, error: transactionError },
    { data: budgetRows, error: budgetError },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("id,type,amount,category,description,date,created_at")
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("monthly_budgets")
      .select("month,categories,updated_at")
      .like("month", yearLike),
  ]);

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  if (budgetError) {
    throw new Error(budgetError.message);
  }

  const transactions = ((transactionRows ?? []) as TransactionRow[]).map(
    toTransaction,
  );
  const budgets = ((budgetRows ?? []) as MonthlyBudgetRow[]).map(toBudget);

  return buildAnnualAnalysisPayload(year, transactions, budgets);
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const nowYear = new Date().getFullYear();
    const requestUrl = new URL(request.url);
    const year = parseAnalysisYear(
      requestUrl.searchParams.get("year"),
      nowYear,
    );
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_annual_analysis_payload",
      { p_year: year },
    );

    if (!rpcError) {
      const payload = parseAnnualAnalysisPayload(rpcData);
      return NextResponse.json({ ok: true, source: "rpc", ...payload });
    }

    if (!isMissingRpcError(rpcError as RpcErrorLike)) {
      throw new Error(rpcError.message);
    }

    console.warn(
      "[analysis/annual] rpc missing, falling back to raw query path",
      rpcError.message,
    );
    const payload = await loadRawAnalysisData(supabase, year);
    return NextResponse.json({ ok: true, source: "raw-fallback", ...payload });
  } catch (error) {
    console.error("[analysis/annual] failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

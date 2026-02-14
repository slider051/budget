import { createClient } from "@/lib/supabase/client";
import { BUDGET_STORAGE_KEY } from "@/lib/constants";
import { notifyStorageChange } from "@/lib/storage/localStorageStore";
import type { MonthlyBudget } from "@/types/monthlyBudget";

interface MonthlyBudgetRow {
  id: string;
  month: string;
  categories: unknown;
  updated_at: string;
}

function normalizeCategories(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, number>>(
    (acc, [key, raw]) => {
      const parsed = typeof raw === "number" ? raw : Number(raw);
      if (Number.isFinite(parsed)) {
        acc[key] = parsed;
      }
      return acc;
    },
    {},
  );
}

function mapRowToBudget(row: MonthlyBudgetRow): MonthlyBudget {
  return {
    month: row.month,
    categories: normalizeCategories(row.categories),
    updatedAt: row.updated_at,
  };
}

function syncBudgetCache(budgets: readonly MonthlyBudget[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
  notifyStorageChange(BUDGET_STORAGE_KEY);
}

async function listBudgetRows(): Promise<MonthlyBudgetRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("id,month,categories,updated_at")
    .order("month", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MonthlyBudgetRow[];
}

export async function listAllBudgets(): Promise<MonthlyBudget[]> {
  const rows = await listBudgetRows();
  const budgets = rows.map(mapRowToBudget);
  syncBudgetCache(budgets);
  return budgets;
}

export async function getBudget(month: string): Promise<MonthlyBudget | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("id,month,categories,updated_at")
    .eq("month", month)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapRowToBudget(data as MonthlyBudgetRow);
}

export async function upsertBudget(
  month: string,
  categories: Record<string, number>,
): Promise<void> {
  const supabase = createClient();
  const updatedAt = new Date().toISOString();

  const { data: existingRows, error: findError } = await supabase
    .from("monthly_budgets")
    .select("id")
    .eq("month", month)
    .limit(1);

  if (findError) {
    throw new Error(findError.message);
  }

  const existing = existingRows?.[0] as { id: string } | undefined;

  if (existing?.id) {
    const { error } = await supabase
      .from("monthly_budgets")
      .update({ categories, updated_at: updatedAt })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("monthly_budgets")
      .insert({ month, categories, updated_at: updatedAt });

    if (error) {
      throw new Error(error.message);
    }
  }

  await listAllBudgets();
}

export async function listBudgetsByYear(year: number): Promise<MonthlyBudget[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("id,month,categories,updated_at")
    .like("month", `${year}-%`)
    .order("month", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const budgets = ((data ?? []) as MonthlyBudgetRow[]).map(mapRowToBudget);

  if (typeof window !== "undefined") {
    const existing = localStorage.getItem(BUDGET_STORAGE_KEY);
    const parsed: MonthlyBudget[] = existing ? JSON.parse(existing) : [];
    const merged = [
      ...parsed.filter((item) => !item.month.startsWith(`${year}-`)),
      ...budgets,
    ];
    syncBudgetCache(merged);
  }

  return budgets;
}

export async function deleteBudget(month: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("monthly_budgets")
    .delete()
    .eq("month", month);

  if (error) {
    throw new Error(error.message);
  }

  await listAllBudgets();
}

export async function applyYearTemplate(
  year: number,
  categories: Record<string, number>,
): Promise<void> {
  const tasks: Promise<void>[] = [];

  for (let month = 1; month <= 12; month += 1) {
    const monthStr = String(month).padStart(2, "0");
    const monthKey = `${year}-${monthStr}`;
    tasks.push(upsertBudget(monthKey, categories));
  }

  await Promise.all(tasks);
}

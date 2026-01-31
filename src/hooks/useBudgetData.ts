import { useCallback, useMemo, useSyncExternalStore } from "react";
import { BUDGET_STORAGE_KEY } from "@/lib/constants";
import { createLocalStorageStore } from "@/lib/storage/localStorageStore";
import type { MonthlyBudget } from "@/types/monthlyBudget";

const budgetStore = createLocalStorageStore<MonthlyBudget[]>(
  BUDGET_STORAGE_KEY,
  (raw) => JSON.parse(raw),
  [],
);

export function useBudgetData(month: string) {
  const budgets = useSyncExternalStore(
    budgetStore.subscribe,
    budgetStore.getSnapshot,
    budgetStore.getServerSnapshot,
  );

  const budget = useMemo(
    () => budgets.find((b) => b.month === month) ?? null,
    [budgets, month],
  );

  const refresh = useCallback(() => {
    // No-op: useSyncExternalStore auto-syncs via storage events.
    // Kept for API compatibility.
  }, []);

  return { budget, isLoading: false, refresh };
}

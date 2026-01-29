import { useState, useEffect, useCallback } from "react";
import { getBudget } from "@/lib/budget/budgetRepository";
import type { MonthlyBudget } from "@/types/monthlyBudget";

/**
 * Hook to load budget data from localStorage for a given month.
 * Handles hydration by loading after mount.
 */
export function useBudgetData(month: string) {
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBudget = useCallback(() => {
    setIsLoading(true);
    const loaded = getBudget(month);
    setBudget(loaded);
    setIsLoading(false);
  }, [month]);

  useEffect(() => {
    // This is a valid use case: syncing with external system (localStorage)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBudget();
  }, [loadBudget]);

  return { budget, isLoading, refresh: loadBudget };
}

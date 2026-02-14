import { useCallback, useEffect, useState } from "react";
import { getBudget } from "@/lib/budget/budgetRepository";
import type { MonthlyBudget } from "@/types/monthlyBudget";

export function useBudgetData(month: string) {
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await getBudget(month);
      setBudget(next);
    } catch (error) {
      console.error("Failed to load budget:", error);
      setBudget(null);
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { budget, isLoading, refresh };
}

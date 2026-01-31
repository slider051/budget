import type { BudgetFilterState, BudgetStatus } from "@/types/budgetFilter";

export interface BudgetCategoryData {
  readonly category: string;
  readonly koreanName: string;
  readonly spent: number;
  readonly budget: number;
  readonly icon: string;
  readonly usagePct: number | null;
}

export function getBudgetStatus(usagePct: number | null): BudgetStatus {
  if (usagePct === null) return "unset";
  if (usagePct >= 100) return "over";
  if (usagePct >= 90) return "warning";
  return "ok";
}

export function applyBudgetFilters(
  categories: readonly BudgetCategoryData[],
  filters: BudgetFilterState,
): readonly BudgetCategoryData[] {
  let filtered = [...categories];

  if (filters.q.trim()) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.category.toLowerCase().includes(query) ||
        c.koreanName.toLowerCase().includes(query),
    );
  }

  if (filters.status !== "all") {
    filtered = filtered.filter(
      (c) => getBudgetStatus(c.usagePct) === filters.status,
    );
  }

  const minUsage = filters.minUsage ? parseFloat(filters.minUsage) : null;
  if (minUsage !== null && !isNaN(minUsage)) {
    const clampedMin = Math.max(0, Math.min(100, minUsage));
    filtered = filtered.filter(
      (c) => c.usagePct !== null && c.usagePct >= clampedMin,
    );
  }

  const sorted = [...filtered].sort((a, b) => {
    let primary = 0;

    switch (filters.sort) {
      case "usagePct": {
        const aVal = a.usagePct ?? -1;
        const bVal = b.usagePct ?? -1;
        primary = filters.dir === "desc" ? bVal - aVal : aVal - bVal;
        break;
      }
      case "spent":
        primary = filters.dir === "desc" ? b.spent - a.spent : a.spent - b.spent;
        break;
      case "remaining": {
        const aRemaining = a.budget - a.spent;
        const bRemaining = b.budget - b.spent;
        primary =
          filters.dir === "desc"
            ? bRemaining - aRemaining
            : aRemaining - bRemaining;
        break;
      }
    }

    if (primary !== 0) return primary;

    return a.koreanName.localeCompare(b.koreanName);
  });

  return sorted;
}

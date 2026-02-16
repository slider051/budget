export type BudgetUsageVisualState = "ok" | "warning" | "over" | "unset";

export function getUsagePercent(spent: number, budget: number): number | null {
  if (!Number.isFinite(spent) || !Number.isFinite(budget) || budget <= 0) {
    return null;
  }

  return (spent / budget) * 100;
}

export function getUsageVisualState(
  usagePct: number | null,
): BudgetUsageVisualState {
  if (usagePct === null || !Number.isFinite(usagePct)) {
    return "unset";
  }

  if (usagePct >= 100) {
    return "over";
  }

  if (usagePct > 80) {
    return "warning";
  }

  return "ok";
}

export function getProgressWidthPercent(usagePct: number | null): number {
  if (usagePct === null || !Number.isFinite(usagePct)) {
    return 0;
  }

  return Math.max(0, Math.min(100, usagePct));
}

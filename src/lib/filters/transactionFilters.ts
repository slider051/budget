import type { Transaction } from "@/types/budget";
import type { TransactionFilterState } from "@/types/filter";

export function getDefaultDateRange(): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  return {
    dateFrom: formatDate(yearStart),
    dateTo: formatDate(today),
  };
}

export function applyTransactionFilters(
  transactions: readonly Transaction[],
  filters: TransactionFilterState,
): readonly Transaction[] {
  let filtered = [...transactions];

  if (filters.q.trim()) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query),
    );
  }

  if (filters.type !== "all") {
    filtered = filtered.filter((t) => t.type === filters.type);
  }

  if (filters.categories.length > 0) {
    filtered = filtered.filter((t) => filters.categories.includes(t.category));
  }

  if (filters.dateFrom) {
    filtered = filtered.filter((t) => t.date >= filters.dateFrom);
  }

  if (filters.dateTo) {
    filtered = filtered.filter((t) => t.date <= filters.dateTo);
  }

  let minAmount = filters.minAmount ? parseFloat(filters.minAmount) : null;
  let maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : null;

  // Swap 정책: min > max인 경우 필터 적용 단계에서만 조용히 swap (입력 UI는 건드리지 않음)
  if (
    minAmount !== null &&
    maxAmount !== null &&
    !isNaN(minAmount) &&
    !isNaN(maxAmount) &&
    minAmount > maxAmount
  ) {
    [minAmount, maxAmount] = [maxAmount, minAmount];
  }

  if (minAmount !== null && !isNaN(minAmount)) {
    filtered = filtered.filter((t) => t.amount >= minAmount);
  }

  if (maxAmount !== null && !isNaN(maxAmount)) {
    filtered = filtered.filter((t) => t.amount <= maxAmount);
  }

  const sorted = [...filtered].sort((a, b) => {
    let primary = 0;

    switch (filters.sort) {
      case "latest":
        primary = new Date(b.date).getTime() - new Date(a.date).getTime();
        break;
      case "oldest":
        primary = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case "amount-asc":
        primary = a.amount - b.amount;
        break;
      case "amount-desc":
        primary = b.amount - a.amount;
        break;
      default:
        primary = 0;
    }

    if (primary !== 0) return primary;

    return a.id.localeCompare(b.id);
  });

  return sorted;
}

export function calculateFilteredSummary(
  transactions: readonly Transaction[],
): {
  readonly count: number;
  readonly totalIncome: number;
  readonly totalExpense: number;
} {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    count: transactions.length,
    totalIncome,
    totalExpense,
  };
}

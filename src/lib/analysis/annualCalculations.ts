import type { Transaction } from "../../types/budget.ts";
import type { MonthlyBudget } from "../../types/monthlyBudget.ts";

export interface AnnualSummary {
  readonly year: number;
  readonly totalIncome: number;
  readonly totalExpense: number;
  readonly netSavings: number;
}

export interface MonthlySummary {
  readonly month: string;
  readonly monthLabel: string;
  readonly income: number;
  readonly expense: number;
  readonly netSavings: number;
  readonly budget: number;
}

export interface CategoryAnnualTotal {
  readonly category: string;
  readonly amount: number;
  readonly percentage: number;
}

export function calculateAnnualSummary(
  transactions: readonly Transaction[],
  year: number,
): AnnualSummary {
  const yearTransactions = transactions.filter((t) =>
    t.date.startsWith(`${year}-`),
  );

  const totalIncome = yearTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = yearTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    year,
    totalIncome,
    totalExpense,
    netSavings: totalIncome - totalExpense,
  };
}

export function calculateMonthlySummaries(
  transactions: readonly Transaction[],
  budgets: readonly MonthlyBudget[],
  year: number,
): readonly MonthlySummary[] {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return months.map((month) => {
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    const monthTransactions = transactions.filter((t) =>
      t.date.startsWith(monthKey),
    );

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const budget = budgets.find((b) => b.month === monthKey);
    const budgetTotal = budget
      ? Object.values(budget.categories).reduce((sum, val) => sum + val, 0)
      : 0;

    return {
      month: monthKey,
      monthLabel: `${month}월`,
      income,
      expense,
      netSavings: income - expense,
      budget: budgetTotal,
    };
  });
}

export function calculateCategoryAnnualTotals(
  transactions: readonly Transaction[],
  year: number,
  type: "income" | "expense",
): readonly CategoryAnnualTotal[] {
  const yearTransactions = transactions.filter(
    (t) => t.date.startsWith(`${year}-`) && t.type === type,
  );

  const categoryMap = new Map<string, number>();

  yearTransactions.forEach((t) => {
    const current = categoryMap.get(t.category) ?? 0;
    categoryMap.set(t.category, current + t.amount);
  });

  const total = Array.from(categoryMap.values()).reduce(
    (sum, val) => sum + val,
    0,
  );

  const results = Array.from(categoryMap.entries()).map(
    ([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }),
  );

  return results.sort((a, b) => b.amount - a.amount);
}

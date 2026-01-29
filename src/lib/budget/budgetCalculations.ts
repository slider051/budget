import type { Transaction } from '@/types/budget';
import type { MonthlyBudget } from '@/types/monthlyBudget';

/**
 * Calculate spent amount for a specific category in a specific month
 */
export function calculateCategorySpent(
  transactions: readonly Transaction[],
  month: string,
  category: string
): number {
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.category === category &&
        t.date.startsWith(month) // YYYY-MM-DD starts with YYYY-MM
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total spent in a specific month
 */
export function calculateMonthlySpent(
  transactions: readonly Transaction[],
  month: string
): number {
  return transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total budget for a month
 */
export function calculateMonthlyBudgetTotal(budget: MonthlyBudget | null): number {
  if (!budget) return 0;
  return Object.values(budget.categories).reduce((sum, val) => sum + val, 0);
}

/**
 * Calculate total income for a specific month
 */
export function calculateMonthlyIncome(
  transactions: readonly Transaction[],
  month: string
): number {
  return transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get top expenses for a month (by category)
 */
export function getTopExpensesByMonth(
  transactions: readonly Transaction[],
  month: string,
  limit = 7
): Array<{ category: string; amount: number; count: number }> {
  const categoryMap = new Map<string, { amount: number; count: number }>();

  transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(month))
    .forEach((t) => {
      const existing = categoryMap.get(t.category) ?? { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      });
    });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Get top income sources for a month (by category)
 */
export function getTopIncomeByMonth(
  transactions: readonly Transaction[],
  month: string,
  limit = 7
): Array<{ category: string; amount: number; count: number }> {
  const categoryMap = new Map<string, { amount: number; count: number }>();

  transactions
    .filter((t) => t.type === 'income' && t.date.startsWith(month))
    .forEach((t) => {
      const existing = categoryMap.get(t.category) ?? { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      });
    });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

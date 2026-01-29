import { BUDGET_STORAGE_KEY } from '@/lib/constants';
import type { MonthlyBudget } from '@/types/monthlyBudget';

/**
 * Get budget for a specific month
 */
export function getBudget(month: string): MonthlyBudget | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!data) return null;

    const budgets: MonthlyBudget[] = JSON.parse(data);
    return budgets.find((b) => b.month === month) ?? null;
  } catch {
    return null;
  }
}

/**
 * Upsert (create or update) budget for a specific month
 */
export function upsertBudget(
  month: string,
  categories: Record<string, number>
): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(BUDGET_STORAGE_KEY);
    const budgets: MonthlyBudget[] = data ? JSON.parse(data) : [];

    const existingIndex = budgets.findIndex((b) => b.month === month);

    const newBudget: MonthlyBudget = {
      month,
      categories,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing
      const updatedBudgets = [...budgets];
      updatedBudgets[existingIndex] = newBudget;
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
    } else {
      // Create new
      const updatedBudgets = [...budgets, newBudget];
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(updatedBudgets));
    }
  } catch (error) {
    console.error('Failed to upsert budget:', error);
  }
}

/**
 * List all budgets for a specific year
 */
export function listBudgetsByYear(year: number): MonthlyBudget[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!data) return [];

    const budgets: MonthlyBudget[] = JSON.parse(data);
    return budgets.filter((b) => b.month.startsWith(`${year}-`));
  } catch {
    return [];
  }
}

/**
 * Delete budget for a specific month
 */
export function deleteBudget(month: string): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!data) return;

    const budgets: MonthlyBudget[] = JSON.parse(data);
    const filtered = budgets.filter((b) => b.month !== month);

    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete budget:', error);
  }
}

/**
 * Apply year template: create budgets for 12 months
 */
export function applyYearTemplate(
  year: number,
  categories: Record<string, number>
): void {
  if (typeof window === 'undefined') return;

  for (let month = 1; month <= 12; month++) {
    const monthStr = String(month).padStart(2, '0');
    const monthKey = `${year}-${monthStr}`;
    upsertBudget(monthKey, categories);
  }
}

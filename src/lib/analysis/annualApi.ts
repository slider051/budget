import {
  calculateAnnualSummary,
  calculateCategoryAnnualTotals,
  calculateMonthlySummaries,
} from "./annualCalculations.ts";
import type { Transaction } from "../../types/budget.ts";
import type { MonthlyBudget } from "../../types/monthlyBudget.ts";
import type { AnnualAnalysisPayload } from "../../types/analysis.ts";

const MIN_ANALYSIS_YEAR = 2000;
const MAX_ANALYSIS_YEAR = 2100;

export function parseAnalysisYear(
  yearParam: string | null,
  fallbackYear: number,
): number {
  if (!yearParam) return fallbackYear;
  const parsed = Number.parseInt(yearParam, 10);

  if (!Number.isFinite(parsed)) return fallbackYear;
  if (parsed < MIN_ANALYSIS_YEAR || parsed > MAX_ANALYSIS_YEAR) {
    return fallbackYear;
  }

  return parsed;
}

export function buildAnnualAnalysisPayload(
  year: number,
  transactions: readonly Transaction[],
  budgets: readonly MonthlyBudget[],
): AnnualAnalysisPayload {
  return {
    year,
    summary: calculateAnnualSummary(transactions, year),
    monthlySummaries: calculateMonthlySummaries(transactions, budgets, year),
    expenseTotals: calculateCategoryAnnualTotals(transactions, year, "expense"),
    incomeTotals: calculateCategoryAnnualTotals(transactions, year, "income"),
  };
}

import {
  calculateAnnualSummary,
  calculateCategoryAnnualTotals,
  calculateMonthlySummaries,
} from "./annualCalculations.ts";
import { z } from "zod";
import type { Transaction } from "../../types/budget.ts";
import type { MonthlyBudget } from "../../types/monthlyBudget.ts";
import type { AnnualAnalysisPayload } from "../../types/analysis.ts";

const MIN_ANALYSIS_YEAR = 2000;
const MAX_ANALYSIS_YEAR = 2100;

const annualSummarySchema = z.object({
  year: z.number().int(),
  totalIncome: z.number(),
  totalExpense: z.number(),
  netSavings: z.number(),
});

const monthlySummarySchema = z.object({
  month: z.string(),
  monthLabel: z.string(),
  income: z.number(),
  expense: z.number(),
  netSavings: z.number(),
  budget: z.number(),
});

const categoryAnnualTotalSchema = z.object({
  category: z.string(),
  amount: z.number(),
  percentage: z.number(),
});

const annualAnalysisPayloadSchema = z.object({
  year: z.number().int(),
  summary: annualSummarySchema,
  monthlySummaries: z.array(monthlySummarySchema),
  expenseTotals: z.array(categoryAnnualTotalSchema),
  incomeTotals: z.array(categoryAnnualTotalSchema),
});

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

export function parseAnnualAnalysisPayload(
  input: unknown,
): AnnualAnalysisPayload {
  return annualAnalysisPayloadSchema.parse(input);
}

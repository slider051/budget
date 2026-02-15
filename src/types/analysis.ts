import type {
  AnnualSummary,
  CategoryAnnualTotal,
  MonthlySummary,
} from "../lib/analysis/annualCalculations.ts";

export interface AnnualAnalysisPayload {
  readonly year: number;
  readonly summary: AnnualSummary;
  readonly monthlySummaries: readonly MonthlySummary[];
  readonly expenseTotals: readonly CategoryAnnualTotal[];
  readonly incomeTotals: readonly CategoryAnnualTotal[];
}

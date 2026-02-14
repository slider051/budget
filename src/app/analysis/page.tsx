"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBudget } from "@/hooks/useBudget";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import AnnualKPICards from "@/components/analysis/AnnualKPICards";
import MonthlySummaryTable from "@/components/analysis/MonthlySummaryTable";
import CategoryAnnualTotals from "@/components/analysis/CategoryAnnualTotals";
import {
  calculateAnnualSummary,
  calculateMonthlySummaries,
  calculateCategoryAnnualTotals,
} from "@/lib/analysis/annualCalculations";
import { listBudgetsByYear } from "@/lib/budget/budgetRepository";
import type { MonthlyBudget } from "@/types/monthlyBudget";

function AnalysisContent() {
  const { state } = useBudget();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);

  const currentYear = new Date().getFullYear();
  const yearParam = searchParams.get("year");
  const parsedYear = yearParam ? parseInt(yearParam, 10) : currentYear;
  const selectedYear = !isNaN(parsedYear) ? parsedYear : currentYear;

  useEffect(() => {
    let cancelled = false;

    listBudgetsByYear(selectedYear)
      .then((rows) => {
        if (!cancelled) {
          setBudgets(rows);
        }
      })
      .catch((error) => {
        console.error("Failed to load budgets for analysis:", error);
        if (!cancelled) {
          setBudgets([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  const annualSummary = useMemo(
    () => calculateAnnualSummary(state.transactions, selectedYear),
    [state.transactions, selectedYear],
  );

  const monthlySummaries = useMemo(
    () => calculateMonthlySummaries(state.transactions, budgets, selectedYear),
    [state.transactions, budgets, selectedYear],
  );

  const expenseTotals = useMemo(
    () =>
      calculateCategoryAnnualTotals(
        state.transactions,
        selectedYear,
        "expense",
      ),
    [state.transactions, selectedYear],
  );

  const incomeTotals = useMemo(
    () =>
      calculateCategoryAnnualTotals(state.transactions, selectedYear, "income"),
    [state.transactions, selectedYear],
  );

  const handlePreviousYear = () => {
    router.push(`/analysis?year=${selectedYear - 1}`);
  };

  const handleNextYear = () => {
    router.push(`/analysis?year=${selectedYear + 1}`);
  };

  const handleCurrentYear = () => {
    router.push("/analysis");
  };

  return (
    <div>
      <PageHeader
        title="Annual Analysis"
        description="Analyze your income and expenses by year"
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handlePreviousYear} variant="outline">
            이전
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{selectedYear}년</h2>
          <Button onClick={handleNextYear} variant="outline">
            다음
          </Button>
        </div>
        {selectedYear !== currentYear && (
          <Button onClick={handleCurrentYear} variant="secondary">
            현재 연도
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <AnnualKPICards summary={annualSummary} />

        <MonthlySummaryTable summaries={monthlySummaries} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CategoryAnnualTotals
            title="카테고리별 지출 Top"
            totals={expenseTotals}
            colorClass="text-red-600"
          />
          <CategoryAnnualTotals
            title="카테고리별 수입 Top"
            totals={incomeTotals}
            colorClass="text-green-600"
          />
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div>
          <PageHeader
            title="Annual Analysis"
            description="Analyze your income and expenses by year"
          />
          <div className="py-12 text-center text-gray-500">Loading...</div>
        </div>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}

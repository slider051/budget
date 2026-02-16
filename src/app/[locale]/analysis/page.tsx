"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import AnnualKPICards from "@/components/analysis/AnnualKPICards";
import MonthlySummaryTable from "@/components/analysis/MonthlySummaryTable";
import CategoryAnnualTotals from "@/components/analysis/CategoryAnnualTotals";
import { parseAnalysisYear } from "@/lib/analysis/annualApi";
import { useAnnualAnalysis } from "@/hooks/useAnnualAnalysis";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("analysis");
  const tc = useTranslations("common");

  const currentYear = new Date().getFullYear();
  const selectedYear = parseAnalysisYear(searchParams.get("year"), currentYear);
  const { analysis, isLoading, error } = useAnnualAnalysis(selectedYear);

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
    <div className="section-stack-wide">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handlePreviousYear} variant="outline">
            {tc("previous")}
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedYear}
            {tc("year")}
          </h2>
          <Button onClick={handleNextYear} variant="outline">
            {tc("next")}
          </Button>
        </div>
        {selectedYear !== currentYear && (
          <Button onClick={handleCurrentYear} variant="secondary">
            {tc("currentYear")}
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500">
          {t("loadingAnalysis")}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && analysis && (
        <div className="space-y-6">
          <AnnualKPICards summary={analysis.summary} />

          <MonthlySummaryTable summaries={analysis.monthlySummaries} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryAnnualTotals
              title={t("expenseByCategory")}
              totals={analysis.expenseTotals}
              colorClass="text-red-600"
            />
            <CategoryAnnualTotals
              title={t("incomeByCategory")}
              totals={analysis.incomeTotals}
              colorClass="text-green-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisFallback() {
  const t = useTranslations("analysis");
  const tc = useTranslations("common");
  return (
    <div className="section-stack-wide">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="py-12 text-center text-gray-500">{tc("loading")}</div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<AnalysisFallback />}>
      <AnalysisContent />
    </Suspense>
  );
}

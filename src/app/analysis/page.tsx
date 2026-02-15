"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import AnnualKPICards from "@/components/analysis/AnnualKPICards";
import MonthlySummaryTable from "@/components/analysis/MonthlySummaryTable";
import CategoryAnnualTotals from "@/components/analysis/CategoryAnnualTotals";
import { parseAnalysisYear } from "@/lib/analysis/annualApi";
import type { AnnualAnalysisPayload } from "@/types/analysis";

interface AnnualAnalysisApiResponse extends AnnualAnalysisPayload {
  readonly ok: boolean;
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnnualAnalysisPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const selectedYear = parseAnalysisYear(searchParams.get("year"), currentYear);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/analysis/annual?year=${selectedYear}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const body = (await response.json()) as
          | AnnualAnalysisApiResponse
          | { error?: string };

        if (!response.ok) {
          const message =
            "error" in body && typeof body.error === "string"
              ? body.error
              : "Failed to load annual analysis";
          throw new Error(message);
        }

        if (!cancelled) {
          setAnalysis(body as AnnualAnalysisPayload);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to load annual analysis";
          setError(message);
          setAnalysis(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

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

      {isLoading && (
        <div className="py-12 text-center text-gray-500">
          Loading analysis...
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
              title="카테고리별 지출 Top"
              totals={analysis.expenseTotals}
              colorClass="text-red-600"
            />
            <CategoryAnnualTotals
              title="카테고리별 수입 Top"
              totals={analysis.incomeTotals}
              colorClass="text-green-600"
            />
          </div>
        </div>
      )}
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

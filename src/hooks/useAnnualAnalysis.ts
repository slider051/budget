"use client";

import { useEffect, useState } from "react";
import type { AnnualAnalysisPayload } from "@/types/analysis";

interface AnnualAnalysisApiResponse extends AnnualAnalysisPayload {
  readonly ok: boolean;
}

interface UseAnnualAnalysisResult {
  readonly analysis: AnnualAnalysisPayload | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export function useAnnualAnalysis(year: number): UseAnnualAnalysisResult {
  const [analysis, setAnalysis] = useState<AnnualAnalysisPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/analysis/annual?year=${year}`,
          { method: "GET", cache: "no-store" },
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
  }, [year]);

  return { analysis, isLoading, error };
}

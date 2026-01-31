"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { BudgetFilterState } from "@/types/budgetFilter";

interface BudgetFilterControlsProps {
  readonly filters: BudgetFilterState;
}

export default function BudgetFilterControls({
  filters,
}: BudgetFilterControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (updates: Partial<BudgetFilterState>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`/budget?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleReset = () => {
    router.push("/budget");
  };

  const hasActiveFilters =
    filters.q ||
    filters.status !== "all" ||
    filters.sort !== "usagePct" ||
    filters.dir !== "desc" ||
    filters.minUsage;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Input
          type="text"
          placeholder="카테고리 검색"
          value={filters.q}
          onChange={(e) => updateFilter({ q: e.target.value })}
        />

        <Select
          value={filters.status}
          onChange={(e) =>
            updateFilter({
              status: e.target.value as BudgetFilterState["status"],
            })
          }
          options={[
            { value: "all", label: "전체 상태" },
            { value: "ok", label: "정상 (<90%)" },
            { value: "warning", label: "주의 (90-99%)" },
            { value: "over", label: "초과 (≥100%)" },
            { value: "unset", label: "미설정" },
          ]}
        />

        <Select
          value={filters.sort}
          onChange={(e) =>
            updateFilter({
              sort: e.target.value as BudgetFilterState["sort"],
            })
          }
          options={[
            { value: "usagePct", label: "사용률" },
            { value: "spent", label: "지출액" },
            { value: "remaining", label: "남은 금액" },
          ]}
        />

        <Select
          value={filters.dir}
          onChange={(e) =>
            updateFilter({
              dir: e.target.value as BudgetFilterState["dir"],
            })
          }
          options={[
            { value: "desc", label: "높은순" },
            { value: "asc", label: "낮은순" },
          ]}
        />

        <Input
          type="number"
          placeholder="최소 사용률 (%)"
          min="0"
          max="100"
          value={filters.minUsage}
          onChange={(e) => updateFilter({ minUsage: e.target.value })}
        />
      </div>

      {hasActiveFilters && (
        <div className="mt-3">
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}

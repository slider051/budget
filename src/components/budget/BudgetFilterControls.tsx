"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("budgetFilter");
  const tb = useTranslations("budget");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

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

  const sortPreset = `${filters.sort}:${filters.dir}`;

  const sortOptions = useMemo(
    () => [
      {
        value: "usagePct:desc",
        label: `${t("usageRate")} (${t("highFirst")})`,
      },
      {
        value: "usagePct:asc",
        label: `${t("usageRate")} (${t("lowFirst")})`,
      },
      {
        value: "spent:desc",
        label: `${t("spentAmount")} (${t("highFirst")})`,
      },
      {
        value: "spent:asc",
        label: `${t("spentAmount")} (${t("lowFirst")})`,
      },
      {
        value: "remaining:desc",
        label: `${t("remaining")} (${t("highFirst")})`,
      },
      {
        value: "remaining:asc",
        label: `${t("remaining")} (${t("lowFirst")})`,
      },
    ],
    [t],
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
        <div className="w-full md:w-64">
          <Select
            value={sortPreset}
            onChange={(e) => {
              const [sort, dir] = e.target.value.split(":");
              updateFilter({
                sort: sort as BudgetFilterState["sort"],
                dir: dir as BudgetFilterState["dir"],
              });
            }}
            options={sortOptions}
            className="py-1.5 text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowMoreFilters((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50"
            aria-label="More filters"
            aria-expanded={showMoreFilters}
          >
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h18M6 12h12M10 20h4"
              />
            </svg>
          </button>

          {hasActiveFilters ? (
            <Button onClick={handleReset} variant="outline" size="sm">
              {tb("resetFilters")}
            </Button>
          ) : null}
        </div>
      </div>

      {showMoreFilters ? (
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 border-t border-gray-200 pt-2.5 md:grid-cols-3">
          <Select
            value={filters.status}
            onChange={(e) =>
              updateFilter({
                status: e.target.value as BudgetFilterState["status"],
              })
            }
            options={[
              { value: "all", label: t("allStatus") },
              { value: "ok", label: t("ok") },
              { value: "warning", label: t("warning") },
              { value: "over", label: t("over") },
              { value: "unset", label: t("unset") },
            ]}
            className="py-1.5 text-sm"
          />

          <Select
            value={filters.dir}
            onChange={(e) =>
              updateFilter({
                dir: e.target.value as BudgetFilterState["dir"],
              })
            }
            options={[
              { value: "desc", label: t("highFirst") },
              { value: "asc", label: t("lowFirst") },
            ]}
            className="py-1.5 text-sm"
          />

          <Input
            type="number"
            placeholder={t("minUsage")}
            min="0"
            max="100"
            value={filters.minUsage}
            onChange={(e) => updateFilter({ minUsage: e.target.value })}
            className="py-1.5 text-sm"
          />
        </div>
      ) : null}
    </section>
  );
}

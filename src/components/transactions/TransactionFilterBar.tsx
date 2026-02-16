"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants";
import type { TransactionFilterState } from "@/types/filter";
import { getDefaultDateRange } from "@/lib/filters/transactionFilters";

interface TransactionFilterBarProps {
  readonly filters: TransactionFilterState;
}

const TYPE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "income", label: "수입" },
  { value: "expense", label: "지출" },
] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "amount-desc", label: "금액 높은순" },
  { value: "amount-asc", label: "금액 낮은순" },
] as const;

export default function TransactionFilterBar({ filters }: TransactionFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isComposingRef = useRef(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.q);
  const [localMinAmountStr, setLocalMinAmountStr] = useState(filters.minAmount);
  const [localMaxAmountStr, setLocalMaxAmountStr] = useState(filters.maxAmount);

  const allCategories = useMemo(
    () => [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES],
    [],
  );
  const defaultRange = getDefaultDateRange();
  const hasActiveFilters =
    filters.q ||
    filters.type !== "all" ||
    filters.categories.length > 0 ||
    filters.dateFrom !== defaultRange.dateFrom ||
    filters.dateTo !== defaultRange.dateTo ||
    filters.minAmount ||
    filters.maxAmount ||
    filters.sort !== "latest";

  const updateFilter = useCallback(
    (updates: Partial<TransactionFilterState>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === "" || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      }
      router.push(`/transactions?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleReset = () => {
    setLocalSearchQuery("");
    setLocalMinAmountStr("");
    setLocalMaxAmountStr("");
    const params = new URLSearchParams();
    params.set("dateFrom", defaultRange.dateFrom);
    params.set("dateTo", defaultRange.dateTo);
    router.push(`/transactions?${params.toString()}`);
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input
          type="text"
          placeholder="검색(메모, 카테고리)"
          value={localSearchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setLocalSearchQuery(value);
            if (!isComposingRef.current) updateFilter({ q: value });
          }}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={(e) => {
            isComposingRef.current = false;
            updateFilter({ q: (e.target as HTMLInputElement).value });
          }}
        />
        <Select
          value={filters.type}
          onChange={(e) => updateFilter({ type: e.target.value as TransactionFilterState["type"] })}
          options={[...TYPE_OPTIONS]}
        />
        <Select
          value={filters.sort}
          onChange={(e) => updateFilter({ sort: e.target.value as TransactionFilterState["sort"] })}
          options={[...SORT_OPTIONS]}
        />
        <div className="flex gap-2">
          {hasActiveFilters ? <Button onClick={handleReset} variant="outline">Reset</Button> : null}
          <Button
            onClick={() => {
              const year = new Date().getFullYear();
              const formatDate = (date: Date) => date.toISOString().split("T")[0];
              const params = new URLSearchParams(searchParams.toString());
              params.set("dateFrom", formatDate(new Date(year, 0, 1)));
              params.set("dateTo", formatDate(new Date(year, 11, 31)));
              router.push(`/transactions?${params.toString()}`);
            }}
            variant="outline"
          >
            {new Date().getFullYear()}년 전체
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Input type="date" value={filters.dateFrom} onChange={(e) => updateFilter({ dateFrom: e.target.value })} />
        <Input type="date" value={filters.dateTo} onChange={(e) => updateFilter({ dateTo: e.target.value })} />
        <Input
          type="number"
          placeholder="최소 금액"
          value={localMinAmountStr}
          onChange={(e) => setLocalMinAmountStr(e.target.value)}
          onBlur={(e) => updateFilter({ minAmount: e.target.value.trim() })}
        />
        <Input
          type="number"
          placeholder="최대 금액"
          value={localMaxAmountStr}
          onChange={(e) => setLocalMaxAmountStr(e.target.value)}
          onBlur={(e) => updateFilter({ maxAmount: e.target.value.trim() })}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((category) => {
            const selected = filters.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  const categories = selected
                    ? filters.categories.filter((item) => item !== category)
                    : [...filters.categories, category];
                  updateFilter({ categories });
                }}
                className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                  selected
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

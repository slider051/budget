"use client";

import { useCallback, useState, useRef, useEffect } from "react";
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

export default function TransactionFilterBar({
  filters,
}: TransactionFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [localSearchQuery, setLocalSearchQuery] = useState(filters.q);
  const [localMinAmountStr, setLocalMinAmountStr] = useState(filters.minAmount);
  const [localMaxAmountStr, setLocalMaxAmountStr] = useState(filters.maxAmount);
  const isComposingRef = useRef(false);
  const lastPushedQRef = useRef(filters.q);

  useEffect(() => {
    if (isComposingRef.current) return;
    if (filters.q === lastPushedQRef.current) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalSearchQuery(filters.q);
  }, [filters.q]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalMinAmountStr(filters.minAmount);
  }, [filters.minAmount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalMaxAmountStr(filters.maxAmount);
  }, [filters.maxAmount]);

  const updateFilter = useCallback(
    (updates: Partial<TransactionFilterState>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`/transactions?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);

    if (!isComposingRef.current) {
      lastPushedQRef.current = value;
      updateFilter({ q: value });
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
    isComposingRef.current = false;
    const finalValue = (e.target as HTMLInputElement).value;
    setLocalSearchQuery(finalValue);
    lastPushedQRef.current = finalValue;
    updateFilter({ q: finalValue });
  };

  const handleReset = () => {
    const defaultRange = getDefaultDateRange();
    const params = new URLSearchParams();
    params.set("dateFrom", defaultRange.dateFrom);
    params.set("dateTo", defaultRange.dateTo);
    router.push(`/transactions?${params.toString()}`);
  };

  const handleViewYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const params = new URLSearchParams(searchParams.toString());
    params.set("dateFrom", formatDate(yearStart));
    params.set("dateTo", formatDate(yearEnd));
    router.push(`/transactions?${params.toString()}`);
  };

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="text"
          placeholder="검색 (메모, 카테고리)"
          value={localSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />

        <Select
          value={filters.type}
          onChange={(e) =>
            updateFilter({
              type: e.target.value as "all" | "income" | "expense",
            })
          }
          options={[
            { value: "all", label: "전체" },
            { value: "income", label: "수입" },
            { value: "expense", label: "지출" },
          ]}
        />

        <Select
          value={filters.sort}
          onChange={(e) =>
            updateFilter({
              sort: e.target.value as TransactionFilterState["sort"],
            })
          }
          options={[
            { value: "latest", label: "최신순" },
            { value: "oldest", label: "오래된순" },
            { value: "amount-desc", label: "금액 높은순" },
            { value: "amount-asc", label: "금액 낮은순" },
          ]}
        />

        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          )}
          <Button onClick={handleViewYear} variant="outline">
            {new Date().getFullYear()}년 전체
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="date"
          placeholder="시작일"
          value={filters.dateFrom}
          onChange={(e) => updateFilter({ dateFrom: e.target.value })}
        />

        <Input
          type="date"
          placeholder="종료일"
          value={filters.dateTo}
          onChange={(e) => updateFilter({ dateTo: e.target.value })}
        />

        <Input
          type="number"
          placeholder="최소 금액"
          value={localMinAmountStr}
          onChange={(e) => setLocalMinAmountStr(e.target.value)}
          onBlur={(e) => {
            const value = e.target.value.trim();
            updateFilter({ minAmount: value });
          }}
        />

        <Input
          type="number"
          placeholder="최대 금액"
          value={localMaxAmountStr}
          onChange={(e) => setLocalMaxAmountStr(e.target.value)}
          onBlur={(e) => {
            const value = e.target.value.trim();
            updateFilter({ maxAmount: value });
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리
        </label>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => {
            const isSelected = filters.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => {
                  const newCategories = isSelected
                    ? filters.categories.filter((c) => c !== cat)
                    : [...filters.categories, cat];
                  updateFilter({ categories: newCategories });
                }}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

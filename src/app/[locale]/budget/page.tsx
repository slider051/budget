"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBudget } from "@/hooks/useBudget";
import { useUI } from "@/hooks/useUI";
import { useBudgetData } from "@/hooks/useBudgetData";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_I18N_KEYS,
} from "@/lib/constants";
import {
  calculateCategorySpent,
  calculateMonthlySpent,
  calculateMonthlyBudgetTotal,
  getTopExpensesByMonth,
} from "@/lib/budget/budgetCalculations";
import BudgetCategoryCard from "@/components/budget/BudgetCategoryCard";
import BudgetSummaryGauge from "@/components/budget/BudgetSummaryGauge";
import BudgetFilterControls from "@/components/budget/BudgetFilterControls";
import PageHeader from "@/components/ui/PageHeader";
import MonthPicker from "@/components/ui/MonthPicker";
import BudgetEditModal from "@/components/budget/BudgetEditModal";
import type { BudgetFilterState } from "@/types/budgetFilter";
import type { BudgetCategoryData } from "@/lib/filters/budgetFilters";
import { applyBudgetFilters } from "@/lib/filters/budgetFilters";
import { getUsagePercent } from "@/lib/budget/budgetUi";

function BudgetContent() {
  const { state } = useBudget();
  const { selectedMonth } = useUI();
  const searchParams = useSearchParams();
  const t = useTranslations("budget");
  const tc = useTranslations("common");
  const tCat = useTranslations("categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { budget, refresh } = useBudgetData(selectedMonth);

  const filters: BudgetFilterState = useMemo(() => {
    const q = searchParams.get("q") || "";
    const status = (searchParams.get("status") ||
      "all") as BudgetFilterState["status"];
    const sort = (searchParams.get("sort") ||
      "usagePct") as BudgetFilterState["sort"];
    const dir = (searchParams.get("dir") || "desc") as BudgetFilterState["dir"];
    let minUsage = searchParams.get("minUsage") || "";

    const minNum = minUsage ? parseFloat(minUsage) : null;
    if (minNum !== null && !isNaN(minNum)) {
      const clamped = Math.max(0, Math.min(100, minNum));
      minUsage = String(clamped);
    }

    return { q, status, sort, dir, minUsage };
  }, [searchParams]);

  const categoryData = useMemo((): readonly BudgetCategoryData[] => {
    return EXPENSE_CATEGORIES.map((category) => {
      const spent = calculateCategorySpent(
        state.transactions,
        selectedMonth,
        category,
      );
      const budgetAmount = budget?.categories[category] ?? 0;
      const usagePct = getUsagePercent(spent, budgetAmount);
      const i18nKey = CATEGORY_I18N_KEYS[category];
      const displayName = i18nKey ? tCat(i18nKey) : category;

      return {
        category: displayName,
        koreanName: category,
        spent,
        budget: budgetAmount,
        icon: CATEGORY_ICONS[category],
        usagePct,
      };
    });
  }, [state.transactions, selectedMonth, budget, tCat]);

  const filteredCategoryData = useMemo(
    () => applyBudgetFilters(categoryData, filters),
    [categoryData, filters],
  );

  const totalBudget = useMemo(
    () => calculateMonthlyBudgetTotal(budget),
    [budget],
  );
  const totalSpent = useMemo(
    () => calculateMonthlySpent(state.transactions, selectedMonth),
    [state.transactions, selectedMonth],
  );
  const remaining = totalBudget - totalSpent;

  const topExpenses = useMemo(() => {
    const top = getTopExpensesByMonth(state.transactions, selectedMonth, 3);
    return top.map((item) => {
      const key = CATEGORY_I18N_KEYS[item.category];
      return {
        category: key ? tCat(key) : item.category,
        amount: item.amount,
        icon: CATEGORY_ICONS[item.category] || "*",
      };
    });
  }, [state.transactions, selectedMonth, tCat]);

  const handleModalSaved = () => {
    refresh();
  };

  const hasBudget = totalBudget > 0;

  return (
    <div className="space-y-4">
      <PageHeader title={t("title")} description={t("description")} />

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <MonthPicker />
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 sm:text-sm"
        >
          {t("addNew")}
        </button>
      </div>

      <BudgetFilterControls filters={filters} />

      {!hasBudget ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
          <p className="text-xs text-yellow-900 sm:text-sm">
            {t("noBudget", { month: selectedMonth })}
          </p>
        </div>
      ) : (
        <BudgetSummaryGauge
          totalSpent={totalSpent}
          totalBudget={totalBudget}
          remaining={remaining}
          topExpenses={topExpenses}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 sm:text-sm">
        <p>
          {filteredCategoryData.length} {tc("items")}
          {filteredCategoryData.length !== categoryData.length ? (
            <span className="text-gray-400">
              {" "}
              ({t("itemCountFiltered", { total: categoryData.length })})
            </span>
          ) : null}
        </p>
      </div>

      <section className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {filteredCategoryData.map((data) => (
          <BudgetCategoryCard
            key={data.category}
            category={data.category}
            spent={data.spent}
            budget={data.budget}
            icon={data.icon}
            onEditBudget={() => setIsModalOpen(true)}
          />
        ))}
      </section>

      <BudgetEditModal
        month={selectedMonth}
        initialCategories={budget?.categories ?? {}}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleModalSaved}
      />
    </div>
  );
}

function BudgetFallback() {
  const t = useTranslations("budget");
  const tc = useTranslations("common");
  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="py-12 text-center text-gray-500">{tc("loading")}</div>
    </div>
  );
}

export default function BudgetPage() {
  return (
    <Suspense fallback={<BudgetFallback />}>
      <BudgetContent />
    </Suspense>
  );
}

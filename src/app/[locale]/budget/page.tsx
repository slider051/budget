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
  getTopIncomeByMonth,
  calculateMonthlyIncome,
} from "@/lib/budget/budgetCalculations";
import BudgetCategoryCard from "@/components/budget/BudgetCategoryCard";
import BudgetSummaryGauge from "@/components/budget/BudgetSummaryGauge";
import TopExpensesList from "@/components/budget/TopExpensesList";
import BudgetFilterControls from "@/components/budget/BudgetFilterControls";
import PageHeader from "@/components/ui/PageHeader";
import MonthPicker from "@/components/ui/MonthPicker";
import BudgetEditModal from "@/components/budget/BudgetEditModal";
import type { BudgetFilterState } from "@/types/budgetFilter";
import type { BudgetCategoryData } from "@/lib/filters/budgetFilters";
import { applyBudgetFilters } from "@/lib/filters/budgetFilters";

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
      const usagePct = budgetAmount > 0 ? (spent / budgetAmount) * 100 : null;
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
  const totalIncome = useMemo(
    () => calculateMonthlyIncome(state.transactions, selectedMonth),
    [state.transactions, selectedMonth],
  );
  const remaining = totalBudget - totalSpent;

  const topExpenses = useMemo(() => {
    const top = getTopExpensesByMonth(state.transactions, selectedMonth, 7);
    return top.map((item) => {
      const key = CATEGORY_I18N_KEYS[item.category];
      return {
        category: key ? tCat(key) : item.category,
        amount: item.amount,
        icon: CATEGORY_ICONS[item.category] || "💸",
        percentage: 0,
      };
    });
  }, [state.transactions, selectedMonth, tCat]);

  const topIncome = useMemo(() => {
    const top = getTopIncomeByMonth(state.transactions, selectedMonth, 7);
    return top.map((item) => {
      const key = CATEGORY_I18N_KEYS[item.category];
      return {
        category: key ? tCat(key) : item.category,
        amount: item.amount,
        icon: CATEGORY_ICONS[item.category] || "💵",
        percentage: 0,
      };
    });
  }, [state.transactions, selectedMonth, tCat]);

  const handleModalSaved = () => {
    refresh();
  };

  const hasBudget = totalBudget > 0;

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <MonthPicker />
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            {t("addNew")}
          </button>
        </div>
        <BudgetFilterControls filters={filters} />
      </div>

      {!hasBudget && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-900">
            {t("noBudget", { month: selectedMonth })}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main Content Area */}
        <div className="min-w-0">
          <div className="mb-4 text-sm text-gray-600">
            {filteredCategoryData.length} {tc("items")}
            {filteredCategoryData.length !== categoryData.length && (
              <span className="text-gray-400">
                {" "}
                ({t("itemCountFiltered", { total: categoryData.length })})
              </span>
            )}
          </div>

          {/* Category Cards Grid */}
          <div className="flex flex-wrap gap-6">
            {filteredCategoryData.map((data) => (
              <BudgetCategoryCard
                key={data.category}
                category={data.category}
                spent={data.spent}
                budget={data.budget}
                icon={data.icon}
                month={selectedMonth}
                koreanName={data.koreanName}
                onEditBudget={() => setIsModalOpen(true)}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="shrink-0 space-y-6">
          {hasBudget && (
            <BudgetSummaryGauge
              totalSpent={totalSpent}
              totalBudget={totalBudget}
              remaining={remaining}
            />
          )}

          {topExpenses.length > 0 && (
            <TopExpensesList expenses={topExpenses} title={t("mostExpenses")} />
          )}

          {topIncome.length > 0 && (
            <TopExpensesList expenses={topIncome} title={t("topIncome")} />
          )}

          {totalIncome > 0 && (
            <div className="w-[340px] bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("monthlyIncome")}
              </h3>
              <div className="text-3xl font-bold text-green-600">
                ₩{totalIncome.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

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
      <div className="text-center py-12 text-gray-500">{tc("loading")}</div>
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

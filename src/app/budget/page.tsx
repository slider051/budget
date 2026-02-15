"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBudget } from "@/hooks/useBudget";
import { useUI } from "@/hooks/useUI";
import { useBudgetData } from "@/hooks/useBudgetData";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_EN_NAMES,
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

      return {
        category: CATEGORY_EN_NAMES[category] || category,
        koreanName: category,
        spent,
        budget: budgetAmount,
        icon: CATEGORY_ICONS[category],
        usagePct,
      };
    });
  }, [state.transactions, selectedMonth, budget]);

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

  // Top expenses
  const topExpenses = useMemo(() => {
    const top = getTopExpensesByMonth(state.transactions, selectedMonth, 7);
    return top.map((item) => ({
      category: CATEGORY_EN_NAMES[item.category] || item.category,
      amount: item.amount,
      icon: CATEGORY_ICONS[item.category] || "💸",
      percentage: 0, // Can add month-over-month comparison later
    }));
  }, [state.transactions, selectedMonth]);

  // Top income
  const topIncome = useMemo(() => {
    const top = getTopIncomeByMonth(state.transactions, selectedMonth, 7);
    return top.map((item) => ({
      category: CATEGORY_EN_NAMES[item.category] || item.category,
      amount: item.amount,
      icon: CATEGORY_ICONS[item.category] || "💵",
      percentage: 0,
    }));
  }, [state.transactions, selectedMonth]);

  const handleModalSaved = () => {
    refresh();
  };

  const hasBudget = totalBudget > 0;

  return (
    <div>
      <PageHeader title="Budget" description="Create and track your budgets" />

      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <MonthPicker />
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            + Add new budget
          </button>
        </div>
        <BudgetFilterControls filters={filters} />
      </div>

      {!hasBudget && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-900">
            <strong>{selectedMonth}</strong> 예산이 설정되지 않았습니다. &quot;+
            Add new budget&quot; 버튼을 눌러 예산을 설정하세요.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        {/* Main Content Area */}
        <div className="min-w-0">
          <div className="mb-4 text-sm text-gray-600">
            {filteredCategoryData.length} items
            {filteredCategoryData.length !== categoryData.length && (
              <span className="text-gray-400">
                {" "}
                (전체 {categoryData.length}개 중)
              </span>
            )}
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        <div className="min-w-0 space-y-6">
          {hasBudget && (
            <BudgetSummaryGauge
              totalSpent={totalSpent}
              totalBudget={totalBudget}
              remaining={remaining}
            />
          )}

          {topExpenses.length > 0 && (
            <TopExpensesList expenses={topExpenses} title="Most expenses" />
          )}

          {topIncome.length > 0 && (
            <TopExpensesList expenses={topIncome} title="Top income" />
          )}

          {totalIncome > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                이번 달 수입
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

export default function BudgetPage() {
  return (
    <Suspense
      fallback={
        <div>
          <PageHeader
            title="Budget"
            description="Create and track your budgets"
          />
          <div className="text-center py-12 text-gray-500">Loading...</div>
        </div>
      }
    >
      <BudgetContent />
    </Suspense>
  );
}

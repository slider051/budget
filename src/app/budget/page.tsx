"use client";

import { useMemo, useState } from "react";
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
import FilterBar from "@/components/budget/FilterBar";
import PageHeader from "@/components/ui/PageHeader";
import MonthPicker from "@/components/ui/MonthPicker";
import BudgetEditModal from "@/components/budget/BudgetEditModal";

export default function BudgetPage() {
  const { state } = useBudget();
  const { selectedMonth } = useUI();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { budget, refresh } = useBudgetData(selectedMonth);

  const categoryData = useMemo(() => {
    return EXPENSE_CATEGORIES.map((category) => {
      const spent = calculateCategorySpent(
        state.transactions,
        selectedMonth,
        category,
      );
      const budgetAmount = budget?.categories[category] ?? 0;

      return {
        category: CATEGORY_EN_NAMES[category] || category,
        koreanName: category,
        spent,
        budget: budgetAmount,
        icon: CATEGORY_ICONS[category],
      };
    });
  }, [state.transactions, selectedMonth, budget]);

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

      <div className="mb-6 flex items-center justify-between">
        <MonthPicker />
        <FilterBar onAddBudgetClick={() => setIsModalOpen(true)} />
      </div>

      {!hasBudget && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-900">
            <strong>{selectedMonth}</strong> 예산이 설정되지 않았습니다. &quot;+
            Add new budget&quot; 버튼을 눌러 예산을 설정하세요.
          </p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Main Content Area */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-gray-600">
            {categoryData.length} items
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categoryData.map((data) => (
              <BudgetCategoryCard
                key={data.category}
                category={data.category}
                spent={data.spent}
                budget={data.budget}
                icon={data.icon}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 space-y-6">
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

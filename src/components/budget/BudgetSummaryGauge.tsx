"use client";

import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/formatters";
import {
  getProgressWidthPercent,
  getUsagePercent,
  getUsageVisualState,
} from "@/lib/budget/budgetUi";

interface TopExpensePreview {
  readonly category: string;
  readonly amount: number;
  readonly icon: string;
}

interface BudgetSummaryGaugeProps {
  totalSpent: number;
  totalBudget: number;
  remaining: number;
  topExpenses: readonly TopExpensePreview[];
}

function getToneClasses(state: ReturnType<typeof getUsageVisualState>) {
  switch (state) {
    case "over":
      return {
        badge: "bg-red-50 text-red-700",
        bar: "bg-red-500",
        label: "text-red-700",
      };
    case "warning":
      return {
        badge: "bg-amber-50 text-amber-700",
        bar: "bg-amber-500",
        label: "text-amber-700",
      };
    case "unset":
      return {
        badge: "bg-gray-100 text-gray-600",
        bar: "bg-gray-300",
        label: "text-gray-600",
      };
    default:
      return {
        badge: "bg-emerald-50 text-emerald-700",
        bar: "bg-emerald-500",
        label: "text-emerald-700",
      };
  }
}

export default function BudgetSummaryGauge({
  totalSpent,
  totalBudget,
  remaining,
  topExpenses,
}: BudgetSummaryGaugeProps) {
  const t = useTranslations("budget");
  const tc = useTranslations("common");

  const usagePct = getUsagePercent(totalSpent, totalBudget);
  const usageState = getUsageVisualState(usagePct);
  const usageWidth = getProgressWidthPercent(usagePct);
  const tone = getToneClasses(usageState);

  const statusText =
    usageState === "over"
      ? tc("over")
      : usageState === "warning"
        ? tc("needAttention")
        : usageState === "unset"
          ? tc("notSet")
          : tc("onTrack");

  const remainingLabel = remaining >= 0 ? tc("left") : tc("over");
  const remainingAmount = Math.abs(remaining);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900">
              {t("monthlyBudget")}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.badge}`}
            >
              {statusText}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-[11px] text-gray-500">{t("monthlyBudget")}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-[11px] text-gray-500">{t("spent")}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-[11px] text-gray-500">{remainingLabel}</p>
              <p className={`mt-1 text-lg font-semibold ${tone.label}`}>
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <p className="text-gray-700">
                {formatCurrency(totalSpent)} {t("spent")} (
                {formatCurrency(remainingAmount)} {remainingLabel})
              </p>
              <p className={`text-xs font-semibold sm:text-sm ${tone.label}`}>
                {usagePct === null ? tc("notSet") : `${usagePct.toFixed(0)}%`}
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ${tone.bar}`}
                style={{ width: `${usageWidth}%` }}
              />
            </div>
          </div>
        </div>

        <aside className="xl:w-72 xl:border-l xl:border-gray-200 xl:pl-4">
          <div className="mb-2.5 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-900 sm:text-sm">
              {t("mostExpenses")}
            </h4>
            <span className="text-[11px] font-medium text-indigo-600 sm:text-xs">
              {tc("thisMonth")}
            </span>
          </div>

          {topExpenses.length === 0 ? (
            <p className="text-xs text-gray-500 sm:text-sm">{tc("noData")}</p>
          ) : (
            <div className="space-y-1.5">
              {topExpenses.map((expense) => (
                <div
                  key={`${expense.category}-${expense.amount}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm">{expense.icon}</span>
                    <span className="truncate text-xs text-gray-700 sm:text-sm">
                      {expense.category}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 sm:text-sm">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

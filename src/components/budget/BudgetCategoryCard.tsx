"use client";

import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/formatters";
import {
  getProgressWidthPercent,
  getUsagePercent,
  getUsageVisualState,
} from "@/lib/budget/budgetUi";

interface BudgetCategoryCardProps {
  category: string;
  spent: number;
  budget: number;
  icon?: string;
  onEditBudget?: () => void;
}

function getToneClasses(state: ReturnType<typeof getUsageVisualState>) {
  switch (state) {
    case "over":
      return {
        badge: "bg-red-50 text-red-700",
        bar: "bg-red-500",
        value: "text-red-700",
      };
    case "warning":
      return {
        badge: "bg-amber-50 text-amber-700",
        bar: "bg-amber-500",
        value: "text-amber-700",
      };
    case "unset":
      return {
        badge: "bg-gray-100 text-gray-600",
        bar: "bg-gray-300",
        value: "text-gray-600",
      };
    default:
      return {
        badge: "bg-emerald-50 text-emerald-700",
        bar: "bg-emerald-500",
        value: "text-emerald-700",
      };
  }
}

export default function BudgetCategoryCard({
  category,
  spent,
  budget,
  icon,
  onEditBudget,
}: BudgetCategoryCardProps) {
  const t = useTranslations("budget");
  const tc = useTranslations("common");

  const usagePct = getUsagePercent(spent, budget);
  const usageState = getUsageVisualState(usagePct);
  const usageWidth = getProgressWidthPercent(usagePct);
  const tone = getToneClasses(usageState);

  const remaining = budget - spent;
  const remainingLabel = remaining >= 0 ? tc("left") : tc("over");
  const remainingAmount = Math.abs(remaining);

  const statusText =
    usageState === "over"
      ? tc("over")
      : usageState === "warning"
        ? tc("needAttention")
        : usageState === "unset"
          ? tc("notSet")
          : tc("onTrack");

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? <span className="text-base">{icon}</span> : null}
          <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
            {category}
          </h3>
        </div>
        {onEditBudget ? (
          <button
            type="button"
            onClick={onEditBudget}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label={t("editBudget")}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-gray-700 sm:text-sm">
          {formatCurrency(spent)} {t("spent")} (
          {formatCurrency(remainingAmount)} {remainingLabel})
        </p>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.badge}`}
        >
          {statusText}
        </span>
      </div>

      <div className="mt-2.5">
        <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500 sm:text-xs">
          <span>{t("monthlyBudget")}</span>
          <span>
            {usagePct === null ? tc("notSet") : `${usagePct.toFixed(0)}%`}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${tone.bar}`}
            style={{ width: `${usageWidth}%` }}
          />
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] sm:text-xs">
        <span className="text-gray-500">{formatCurrency(budget)}</span>
        <span className={`font-semibold ${tone.value}`}>
          {formatCurrency(remainingAmount)} {remainingLabel}
        </span>
      </div>
    </article>
  );
}

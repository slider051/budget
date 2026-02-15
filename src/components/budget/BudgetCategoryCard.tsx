"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CircularProgress from "./CircularProgress";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";
import {
  shouldShowBudgetAlert,
  markAlertAsSeen,
} from "@/lib/alerts/budgetAlerts";

interface BudgetCategoryCardProps {
  category: string;
  spent: number;
  budget: number;
  icon?: string;
  month: string;
  koreanName: string;
  onEditBudget?: () => void;
}

export default function BudgetCategoryCard({
  category,
  spent,
  budget,
  icon,
  month,
  koreanName,
  onEditBudget,
}: BudgetCategoryCardProps) {
  const t = useTranslations("budget");
  const tc = useTranslations("common");
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  const isOnTrack = percentage <= 80;
  const needsAttention = percentage > 80;

  const [showAlert, setShowAlert] = useState(() =>
    shouldShowBudgetAlert(spent, budget, month, koreanName),
  );

  const handleDismissAlert = () => {
    markAlertAsSeen(month, koreanName);
    setShowAlert(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow w-[420px] h-[280px] flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg
            className="w-5 h-5"
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
      </div>

      <div className="flex items-center justify-between flex-1">
        <div className="flex justify-center">
          <CircularProgress percentage={percentage} size="md">
            <div className="text-center">
              <div className="break-all px-1 text-sm font-bold leading-tight text-gray-900">
                {formatCurrency(spent)}
              </div>
              <div className="text-xs text-gray-500">
                {remaining > 0 ? tc("left") : tc("over")}
              </div>
            </div>
          </CircularProgress>
        </div>

        <div className="min-w-0 text-right">
          <div className="mb-1 break-all text-xl font-bold leading-tight text-gray-900">
            {formatCurrency(remaining)}
          </div>
          <div className="mb-3 break-all text-sm text-gray-500">
            / {formatCurrency(budget)}
          </div>
          {isOnTrack && (
            <Badge variant="success">
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {tc("onTrack")}
              </span>
            </Badge>
          )}
          {needsAttention && (
            <Badge variant="warning">
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {tc("needAttention")}
              </span>
            </Badge>
          )}
        </div>
      </div>

      {showAlert && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900 mb-1">
                {t("needsAttention")}
              </p>
              <p className="text-xs text-orange-700 mb-2">
                {t("usedPercent", {
                  category: koreanName,
                  percent: percentage.toFixed(0),
                })}
              </p>
              <div className="flex gap-2">
                {onEditBudget && (
                  <Button onClick={onEditBudget} size="sm" variant="secondary">
                    {t("editBudget")}
                  </Button>
                )}
                <Button
                  onClick={handleDismissAlert}
                  size="sm"
                  variant="outline"
                >
                  {tc("confirm")}
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismissAlert}
              className="text-orange-400 hover:text-orange-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

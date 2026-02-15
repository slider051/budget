"use client";

import CircularProgress from "./CircularProgress";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";

interface BudgetSummaryGaugeProps {
  totalSpent: number;
  totalBudget: number;
  remaining: number;
}

export default function BudgetSummaryGauge({
  totalSpent,
  totalBudget,
  remaining,
}: BudgetSummaryGaugeProps) {
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const percentageRemaining = 100 - percentage;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Monthly budget</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="mb-6 flex flex-col items-center">
        <div className="mb-2 break-all text-center text-2xl font-bold leading-tight text-gray-900 sm:text-3xl xl:text-4xl">
          {formatCurrency(totalBudget)}
        </div>
        {percentage <= 80 && (
          <Badge variant="success">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              on track
            </span>
          </Badge>
        )}
      </div>

      <div className="mb-6 flex justify-center">
        <CircularProgress percentage={percentage} size="lg">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">
              {percentageRemaining.toFixed(0)}% left
            </div>
            <div className="break-all px-2 text-lg font-bold leading-tight text-gray-900 sm:text-xl">
              {formatCurrency(remaining)}
            </div>
          </div>
        </CircularProgress>
      </div>

      <div className="text-center text-sm text-gray-500">
        <span className="font-medium text-gray-900">
          {percentage.toFixed(0)}% spent
        </span>{" "}
        · {formatCurrency(totalSpent)}
      </div>
    </div>
  );
}

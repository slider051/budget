"use client";

import CircularProgress from "./CircularProgress";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";

interface BudgetCategoryCardProps {
  category: string;
  spent: number;
  budget: number;
  icon?: string;
}

export default function BudgetCategoryCard({
  category,
  spent,
  budget,
  icon,
}: BudgetCategoryCardProps) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  const isOnTrack = percentage <= 80;
  const needsAttention = percentage > 80;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
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

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <CircularProgress percentage={percentage} size="md">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(spent)}
              </div>
              <div className="text-xs text-gray-500">
                {remaining > 0 ? "Left" : "Over"}
              </div>
            </div>
          </CircularProgress>
        </div>

        <div className="flex-1 text-right">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(remaining)}
          </div>
          <div className="text-sm text-gray-500 mb-3">
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
                on track
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
                need attention
              </span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

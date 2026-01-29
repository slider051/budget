"use client";

import { useBudget } from "@/hooks/useBudget";
import { groupByCategory, calculateSummary } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function CategoryBreakdown() {
  const { state } = useBudget();
  const expenseGroups = groupByCategory(state.transactions, "expense");
  const summary = calculateSummary(state.transactions);

  if (expenseGroups.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          카테고리별 지출
        </h3>
        <EmptyState message="지출 내역이 없습니다." />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        카테고리별 지출
      </h3>

      <div className="space-y-3">
        {expenseGroups.map((group) => {
          const percentage =
            summary.totalExpense > 0
              ? (group.amount / summary.totalExpense) * 100
              : 0;

          return (
            <div key={group.category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {group.category}
                </span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(group.amount)} ({group.count}건)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {percentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

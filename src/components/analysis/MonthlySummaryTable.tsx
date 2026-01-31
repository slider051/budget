import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/formatters";
import type { MonthlySummary } from "@/lib/analysis/annualCalculations";

interface MonthlySummaryTableProps {
  readonly summaries: readonly MonthlySummary[];
}

export default function MonthlySummaryTable({
  summaries,
}: MonthlySummaryTableProps) {
  const maxExpense = Math.max(...summaries.map((s) => s.expense), 1);

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          월별 요약
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">
                  월
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">
                  수입
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">
                  지출
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">
                  순저축
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">
                  예산
                </th>
                <th className="py-3 px-2 font-medium text-gray-600">추이</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((summary) => {
                const barWidth =
                  summary.expense > 0
                    ? (summary.expense / maxExpense) * 100
                    : 0;
                const isPositive = summary.netSavings >= 0;
                const hasBudget = summary.budget > 0;
                const budgetUsage = hasBudget
                  ? (summary.expense / summary.budget) * 100
                  : 0;

                return (
                  <tr
                    key={summary.month}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-2 font-medium text-gray-900">
                      {summary.monthLabel}
                    </td>
                    <td className="py-3 px-2 text-right text-green-600">
                      {summary.income > 0 ? formatCurrency(summary.income) : "-"}
                    </td>
                    <td className="py-3 px-2 text-right text-red-600">
                      {summary.expense > 0
                        ? formatCurrency(summary.expense)
                        : "-"}
                    </td>
                    <td
                      className={`py-3 px-2 text-right font-medium ${
                        isPositive ? "text-blue-600" : "text-orange-600"
                      }`}
                    >
                      {summary.netSavings !== 0
                        ? formatCurrency(summary.netSavings)
                        : "-"}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600">
                      {hasBudget ? (
                        <span>
                          {formatCurrency(summary.budget)}
                          <span
                            className={`ml-1 text-xs ${
                              budgetUsage > 100
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            ({budgetUsage.toFixed(0)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="w-24 h-4 bg-gray-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-red-400 transition-all"
                          style={{ width: `${Math.min(barWidth, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/formatters";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { CategoryAnnualTotal } from "@/lib/analysis/annualCalculations";

interface CategoryAnnualTotalsProps {
  readonly title: string;
  readonly totals: readonly CategoryAnnualTotal[];
  readonly colorClass: string;
}

export default function CategoryAnnualTotals({
  title,
  totals,
  colorClass,
}: CategoryAnnualTotalsProps) {
  if (totals.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
          <p className="text-sm text-gray-500">데이터가 없습니다</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

        <div className="space-y-3">
          {totals.map((item) => {
            const icon = CATEGORY_ICONS[item.category] || "📌";
            return (
              <div
                key={item.category}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className={`text-base font-semibold ${colorClass}`}>
                  {formatCurrency(item.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

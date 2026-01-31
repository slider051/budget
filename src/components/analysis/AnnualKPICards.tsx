import Card from "@/components/ui/Card";
import { formatCurrency } from "@/lib/formatters";
import type { AnnualSummary } from "@/lib/analysis/annualCalculations";

interface AnnualKPICardsProps {
  readonly summary: AnnualSummary;
}

export default function AnnualKPICards({ summary }: AnnualKPICardsProps) {
  const isPositiveSavings = summary.netSavings >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💰</span>
            <h3 className="text-sm font-medium text-gray-600">연간 총수입</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💸</span>
            <h3 className="text-sm font-medium text-gray-600">연간 총지출</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">
              {isPositiveSavings ? "📈" : "📉"}
            </span>
            <h3 className="text-sm font-medium text-gray-600">연간 순저축</h3>
          </div>
          <p
            className={`text-3xl font-bold ${
              isPositiveSavings ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {formatCurrency(summary.netSavings)}
          </p>
        </div>
      </Card>
    </div>
  );
}

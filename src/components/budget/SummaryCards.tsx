'use client';

import { useBudget } from '@/hooks/useBudget';
import { calculateSummary } from '@/lib/calculations';
import { formatCurrency } from '@/lib/formatters';
import Card from '@/components/ui/Card';

export default function SummaryCards() {
  const { state } = useBudget();
  const summary = calculateSummary(state.transactions);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600 mb-1">
            총 수입
          </span>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </span>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600 mb-1">
            총 지출
          </span>
          <span className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalExpense)}
          </span>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600 mb-1">
            잔액
          </span>
          <span
            className={`text-2xl font-bold ${
              summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(summary.balance)}
          </span>
        </div>
      </Card>
    </div>
  );
}

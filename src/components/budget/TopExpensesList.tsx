'use client';

import { formatCurrency } from '@/lib/formatters';

interface TopExpense {
  category: string;
  amount: number;
  icon: string;
  percentage: number;
}

interface TopExpensesListProps {
  expenses: TopExpense[];
  title?: string;
}

export default function TopExpensesList({ expenses, title = 'Most expenses' }: TopExpensesListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          This month
        </button>
      </div>

      <div className="space-y-3">
        {expenses.map((expense, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-lg">
                {expense.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(expense.amount)}
                </div>
                <div className="text-xs text-gray-500">
                  {expense.category}
                </div>
              </div>
            </div>
            <div className={`text-sm font-medium ${
              expense.percentage > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {expense.percentage > 0 ? '↑' : '↓'} {Math.abs(expense.percentage).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

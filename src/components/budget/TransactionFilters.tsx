'use client';

import { useBudget } from '@/hooks/useBudget';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/constants';
import type { TransactionType } from '@/types/budget';

export default function TransactionFilters() {
  const { state, setFilter } = useBudget();

  const allCategories = [
    ...INCOME_CATEGORIES,
    ...EXPENSE_CATEGORIES,
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            유형
          </label>
          <select
            value={state.filter.type}
            onChange={(e) => setFilter(e.target.value as TransactionType | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            value={state.filter.category}
            onChange={(e) => setFilter(undefined, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {(state.filter.type !== 'all' || state.filter.category !== 'all') && (
          <div className="flex items-end">
            <button
              onClick={() => setFilter('all', 'all')}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

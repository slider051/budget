'use client';

import { useUI } from '@/hooks/useUI';

export default function MonthPicker() {
  const { selectedMonth, setSelectedMonth } = useUI();

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1); // month-2 because Date is 0-indexed
    const newYear = prevDate.getFullYear();
    const newMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1); // month because Date is 0-indexed
    const newYear = nextDate.getFullYear();
    const newMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  const handleToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  };

  const formatMonthDisplay = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    return `${year}년 ${parseInt(month)}월`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrevMonth}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="min-w-[140px] text-center">
        <span className="text-base font-semibold text-gray-900">
          {formatMonthDisplay(selectedMonth)}
        </span>
      </div>

      <button
        onClick={handleNextMonth}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Next month"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        onClick={handleToday}
        className="ml-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
      >
        이번 달
      </button>
    </div>
  );
}

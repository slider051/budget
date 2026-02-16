"use client";

import { useState } from "react";
import type { Transaction } from "@/types/budget";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { useBudget } from "@/hooks/useBudget";

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const { deleteTransaction } = useBudget();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("이 거래를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteTransaction(transaction.id);
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              transaction.type === "income" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <div>
            <div className="font-medium text-gray-900">{transaction.category}</div>
            {transaction.description && (
              <div className="text-sm text-gray-500">{transaction.description}</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div
            className={`font-semibold ${
              transaction.type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </div>
          <div className="text-sm text-gray-500">{formatShortDate(transaction.date)}</div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-gray-400 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="삭제"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

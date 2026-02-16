"use client";

import { useBudget } from "@/hooks/useBudget";
import { filterTransactions, sortTransactionsByDate } from "@/lib/calculations";
import type { Transaction } from "@/types/budget";
import TransactionItem from "./TransactionItem";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

interface TransactionListProps {
  readonly limit?: number;
  readonly transactions?: readonly Transaction[];
}

export default function TransactionList({
  limit,
  transactions: transactionsProp,
}: TransactionListProps) {
  const { state } = useBudget();

  const displayed = transactionsProp
    ? transactionsProp
    : (() => {
        const filtered = filterTransactions(
          state.transactions,
          state.filter.type,
          state.filter.category,
        );
        const sorted = sortTransactionsByDate(filtered, "desc");
        return limit ? sorted.slice(0, limit) : sorted;
      })();

  if (displayed.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">거래 내역</h3>
        <EmptyState message="거래 내역이 없습니다." />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        거래 내역 ({displayed.length}건)
      </h3>
      <div className="space-y-1">
        {displayed.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </Card>
  );
}

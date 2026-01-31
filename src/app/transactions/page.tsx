"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useBudget } from "@/hooks/useBudget";
import TransactionFilterBar from "@/components/transactions/TransactionFilterBar";
import TransactionList from "@/components/budget/TransactionList";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";
import type { TransactionFilterState } from "@/types/filter";
import {
  applyTransactionFilters,
  calculateFilteredSummary,
  getDefaultDateRange,
} from "@/lib/filters/transactionFilters";

function TransactionsContent() {
  const { state } = useBudget();
  const searchParams = useSearchParams();

  const filters: TransactionFilterState = useMemo(() => {
    const q = searchParams.get("q") || "";
    const type = (searchParams.get("type") ||
      "all") as TransactionFilterState["type"];

    const categoriesParam = searchParams.get("categories") || "";
    const categories = categoriesParam
      ? Array.from(
          new Set(
            categoriesParam
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
          ),
        )
      : [];

    const defaultRange = getDefaultDateRange();
    const dateFrom = searchParams.get("dateFrom") || defaultRange.dateFrom;
    const dateTo = searchParams.get("dateTo") || defaultRange.dateTo;

    const minAmount = searchParams.get("minAmount") || "";
    const maxAmount = searchParams.get("maxAmount") || "";

    const sort = (searchParams.get("sort") ||
      "latest") as TransactionFilterState["sort"];

    return {
      q,
      type,
      categories,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      sort,
    };
  }, [searchParams]);

  const filteredTransactions = useMemo(
    () => applyTransactionFilters(state.transactions, filters),
    [state.transactions, filters],
  );

  const summary = useMemo(
    () => calculateFilteredSummary(filteredTransactions),
    [filteredTransactions],
  );

  return (
    <div>
      <PageHeader
        title="거래내역"
        description="전체 수입과 지출 내역을 확인하세요"
        action={
          <Link href="/transactions/new">
            <Button size="sm">+ 새 거래 추가</Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <TransactionFilterBar filters={filters} />

        <Card>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-600">검색 결과</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.count}건
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">총 수입</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">총 지출</p>
                <p className="text-xl font-semibold text-red-600">
                  {formatCurrency(summary.totalExpense)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <TransactionList transactions={filteredTransactions} />
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div>
          <PageHeader
            title="거래내역"
            description="전체 수입과 지출 내역을 확인하세요"
          />
          <div className="text-center py-12 text-gray-500">Loading...</div>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  );
}

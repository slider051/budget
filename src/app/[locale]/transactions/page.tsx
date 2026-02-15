"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBudget } from "@/hooks/useBudget";
import TransactionFilterBar from "@/components/transactions/TransactionFilterBar";
import TransactionList from "@/components/budget/TransactionList";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("transactions");

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
        title={t("title")}
        description={t("description")}
        action={
          <Link href="/transactions/new">
            <Button size="sm">{t("addNew")}</Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <TransactionFilterBar filters={filters} />

        <div className="w-[550px]">
          <Card>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-600">{t("searchResults")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {t("count", { count: summary.count })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("totalIncome")}</p>
                  <p className="text-xl font-semibold text-green-600">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t("totalExpense")}</p>
                  <p className="text-xl font-semibold text-red-600">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-6">
            <TransactionList transactions={filteredTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionsFallback() {
  const t = useTranslations("transactions");
  const tc = useTranslations("common");
  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="text-center py-12 text-gray-500">{tc("loading")}</div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsFallback />}>
      <TransactionsContent />
    </Suspense>
  );
}

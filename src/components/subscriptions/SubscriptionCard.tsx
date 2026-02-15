"use client";

import { memo } from "react";
import Button from "@/components/ui/Button";
import {
  formatMoney,
  getCycleLabel,
  getCycleMonths,
  getDiscountPercent,
  getDisplayedNextPaymentDate,
  getPerPersonDefaultPrice,
  getSubscriptionMonthlyAmount,
  getSubscriptionYearlyAmount,
} from "@/lib/subscriptions/calculations";
import type { Subscription } from "@/types/subscription";

interface SubscriptionCardProps {
  subscription: Subscription;
  isLogoBroken: boolean;
  isMemoOpen: boolean;
  isDeleting: boolean;
  onLogoError: (id: string) => void;
  onToggleMemo: (id: string) => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: () => void;
}

function SubscriptionCardComponent({
  subscription,
  isLogoBroken,
  isMemoOpen,
  isDeleting,
  onLogoError,
  onToggleMemo,
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  const monthlyAmount = getSubscriptionMonthlyAmount(subscription);
  const yearlyAmount = getSubscriptionYearlyAmount(subscription);
  const discountPercent = getDiscountPercent(subscription);
  const nextPayment = getDisplayedNextPaymentDate(subscription);
  const paymentDateLabel =
    nextPayment.reason === "end_date" ? "만료" : "다음 결제";
  const baselinePrice = getPerPersonDefaultPrice(subscription);
  const cycleLabel = getCycleLabel(
    subscription.billingCycle,
    subscription.customCycleMonths,
  );
  const cycleMonths = getCycleMonths(
    subscription.billingCycle,
    subscription.customCycleMonths,
  );

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 p-4 dark:border-gray-700 w-[300px]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          {subscription.logoUrl && !isLogoBroken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={subscription.logoUrl}
              alt={`${subscription.serviceName} logo`}
              className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1 dark:border-gray-700"
              onError={() => onLogoError(subscription.id)}
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-indigo-700">
              {subscription.serviceName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
            {subscription.serviceName}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(subscription)}
            disabled={isDeleting}
          >
            수정
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제중" : "삭제"}
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
          {formatMoney(monthlyAmount, subscription.currency)}/월
        </p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
          정가 {formatMoney(baselinePrice, subscription.currency)}
          {discountPercent > 0 ? ` · ${discountPercent}%↓` : ""}
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {paymentDateLabel} {nextPayment.date ?? "-"}
        </p>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="text-xs font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
          onClick={() => onToggleMemo(subscription.id)}
        >
          {isMemoOpen ? "상세 접기" : "상세"}
        </button>
      </div>

      {isMemoOpen && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
          <p>
            연 환산:{" "}
            <strong>{formatMoney(yearlyAmount, subscription.currency)}</strong>
          </p>
          <p className="mt-1">
            환산 기준: <strong>{cycleMonths}개월</strong> ({cycleLabel})
          </p>
          {subscription.accountName && (
            <p className="mt-1 truncate">계정: {subscription.accountName}</p>
          )}
          {subscription.memo && (
            <p className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
              {subscription.memo}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export const SubscriptionCard = memo(SubscriptionCardComponent);

"use client";

import { memo } from "react";
import Button from "@/components/ui/Button";
import {
  formatMoney,
  getCycleLabel,
  getCycleMonths,
  getCyclePaymentLabel,
  getDiscountPercent,
  getDisplayedNextPaymentDate,
  getPerPersonCyclePrice,
  getPerPersonDefaultPrice,
  getSubscriptionMonthlyAmount,
  getSubscriptionYearlyAmount,
} from "@/lib/subscriptions/calculations";
import { CATEGORY_LABELS } from "@/lib/subscriptions/presets";
import type { Subscription } from "@/types/subscription";

interface SubscriptionCardProps {
  subscription: Subscription;
  isLogoBroken: boolean;
  isMemoOpen: boolean;
  onLogoError: (id: string) => void;
  onToggleMemo: (id: string) => void;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

function SubscriptionCardComponent({
  subscription,
  isLogoBroken,
  isMemoOpen,
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
    nextPayment.reason === "end_date" ? "종료일" : "다음 결제일(예상)";
  const cyclePrice = getPerPersonCyclePrice(subscription);
  const baselinePrice = getPerPersonDefaultPrice(subscription);
  const cycleLabel = getCyclePaymentLabel(
    subscription.billingCycle,
    subscription.customCycleMonths,
  );
  const cycleMonths = getCycleMonths(
    subscription.billingCycle,
    subscription.customCycleMonths,
  );

  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {subscription.logoUrl && !isLogoBroken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={subscription.logoUrl}
              alt={`${subscription.serviceName} logo`}
              className="h-10 w-10 rounded-lg border border-gray-200 bg-white object-contain p-1 dark:border-gray-700"
              onError={() => onLogoError(subscription.id)}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-indigo-700">
              {subscription.serviceName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {subscription.serviceName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {CATEGORY_LABELS[subscription.category]} |{" "}
              {getCycleLabel(subscription.billingCycle, subscription.customCycleMonths)}{" "}
              | 시작일 {subscription.billingStartDate}
            </p>
            {subscription.accountName && (
              <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                계정이름: {subscription.accountName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {subscription.memo && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onToggleMemo(subscription.id)}
            >
              {isMemoOpen ? "메모 숨기기" : "메모 보기"}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onEdit(subscription)}
          >
            수정
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onDelete(subscription.id)}
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-950/30">
        {discountPercent > 0 && (
          <div className="mb-2 inline-flex rounded-md bg-emerald-300 px-3 py-1 shadow-sm">
            <p className="text-sm font-extrabold text-gray-900">
              할인율 {discountPercent}%
            </p>
          </div>
        )}
        <p className="text-xl font-extrabold text-indigo-700 dark:text-indigo-300">
          1인 결제가격: {formatMoney(cyclePrice, subscription.currency)} ({cycleLabel})
        </p>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-2 lg:grid-cols-4">
        <p>
          기본 가격(1인):{" "}
          <strong>{formatMoney(baselinePrice, subscription.currency)}</strong>
        </p>
        <p>
          월 환산: <strong>{formatMoney(monthlyAmount, subscription.currency)}</strong>
        </p>
        <p>
          연 환산: <strong>{formatMoney(yearlyAmount, subscription.currency)}</strong>
        </p>
        <p>
          환산 기준: <strong>{cycleMonths}개월</strong>
        </p>
      </div>

      <div className="mt-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
        {paymentDateLabel}: <strong className="ml-1">{nextPayment.date ?? "-"}</strong>
      </div>

      {isMemoOpen && subscription.memo && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
          {subscription.memo}
        </div>
      )}
    </div>
  );
}

export const SubscriptionCard = memo(SubscriptionCardComponent);

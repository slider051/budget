"use client";

import { memo, useState, useRef, useEffect } from "react";
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

function getDDayInfo(
  dateStr: string | null,
): { days: number; label: string; urgent: boolean } | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  const diffMs = target.getTime() - today.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return null;
  const label = days === 0 ? "D-Day" : `D-${days}`;
  return { days, label, urgent: days <= 7 };
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

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
  const dday = getDDayInfo(nextPayment.date);

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

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-24 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(subscription);
                }}
                disabled={isDeleting}
                className="block w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                disabled={isDeleting}
                className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {isDeleting ? "삭제중" : "삭제"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
          {formatMoney(monthlyAmount, subscription.currency)}/월
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-300">
            정가 {formatMoney(baselinePrice, subscription.currency)}
          </span>
          {discountPercent > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {discountPercent}%↓
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {paymentDateLabel} {nextPayment.date ?? "-"}
          </span>
          {dday && dday.urgent && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                dday.days <= 3
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              }`}
            >
              {dday.label}
            </span>
          )}
        </div>
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

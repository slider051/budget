"use client";

import { memo, useState, useRef, useEffect } from "react";
import {
  formatMoney,
  getCycleProgress,
  getDiscountPercent,
  getDisplayedNextPaymentDate,
  getPerPersonDefaultPrice,
  getSubscriptionMonthlyAmount,
} from "@/lib/subscriptions/calculations";
import type { Subscription } from "@/types/subscription";

interface SubscriptionCardProps {
  subscription: Subscription;
  isLogoBroken: boolean;
  isDeleting: boolean;
  onLogoError: (id: string) => void;
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

function getProgressColor(percent: number): {
  bar: string;
  text: string;
} {
  if (percent >= 80) {
    return {
      bar: "bg-pink-400 dark:bg-pink-500",
      text: "text-pink-600 dark:text-pink-400",
    };
  }
  if (percent >= 50) {
    return {
      bar: "bg-emerald-400 dark:bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
    };
  }
  return {
    bar: "bg-sky-400 dark:bg-sky-500",
    text: "text-sky-600 dark:text-sky-400",
  };
}

function SubscriptionCardComponent({
  subscription,
  isLogoBroken,
  isDeleting,
  onLogoError,
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
  const discountPercent = getDiscountPercent(subscription);
  const nextPayment = getDisplayedNextPaymentDate(subscription);
  const paymentDateLabel =
    nextPayment.reason === "end_date" ? "만료" : "다음 결제";
  const baselinePrice = getPerPersonDefaultPrice(subscription);
  const dday = getDDayInfo(nextPayment.date);
  const progress = getCycleProgress(subscription);
  const progressColor = getProgressColor(progress);

  return (
    <div className="flex h-full w-[260px] flex-col rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      {/* Header: logo + name + menu */}
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

      {/* Price / discount / payment date — aligned to image end */}
      <div className="mt-3 pl-[52px]">
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

      {/* Memo — single line below payment info */}
      {subscription.memo && (
        <p className="mt-2 truncate pl-[52px] text-xs text-amber-700 dark:text-amber-300">
          {subscription.memo}
        </p>
      )}

      {/* Cycle progress bar */}
      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className={progressColor.text}>{progress}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all ${progressColor.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export const SubscriptionCard = memo(SubscriptionCardComponent);

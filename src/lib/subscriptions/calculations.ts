import type {
  BillingCycle,
  Subscription,
  SubscriptionCurrency,
} from "@/types/subscription";

const CURRENCY_LOCALE: Record<SubscriptionCurrency, string> = {
  KRW: "ko-KR",
  USD: "en-US",
  JPY: "ja-JP",
};

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isValidDateString(value: string | null | undefined): value is string {
  return typeof value === "string" && DATE_REGEX.test(value);
}

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, months: number): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedTargetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfMonth = new Date(
    targetYear,
    normalizedTargetMonth + 1,
    0,
  ).getDate();
  const targetDay = Math.min(day, lastDayOfMonth);

  return new Date(targetYear, normalizedTargetMonth, targetDay);
}

function getLocalToday(now: Date): string {
  return formatDate(now);
}

export function getCycleMonths(
  billingCycle: BillingCycle,
  customCycleMonths: number | null,
): number {
  if (billingCycle === "monthly") return 1;
  if (billingCycle === "yearly") return 12;
  return customCycleMonths && customCycleMonths > 0 ? customCycleMonths : 1;
}

export function getParticipantCount(subscription: Subscription): number {
  return subscription.participantCount > 0
    ? Math.floor(subscription.participantCount)
    : 1;
}

export function getPerPersonDefaultPrice(subscription: Subscription): number {
  return round2(subscription.defaultPrice / getParticipantCount(subscription));
}

export function getPerPersonCyclePrice(subscription: Subscription): number {
  return round2(subscription.actualPrice / getParticipantCount(subscription));
}

export function getDiscountPercent(subscription: Subscription): number {
  const baseline = getPerPersonDefaultPrice(subscription);
  const payable = getPerPersonCyclePrice(subscription);

  if (baseline <= 0) return 0;
  if (payable >= baseline) return 0;

  return Math.round(
    ((baseline - payable) / baseline) * 100,
  );
}

export function getSubscriptionMonthlyAmount(subscription: Subscription): number {
  const cycleMonths = getCycleMonths(
    subscription.billingCycle,
    subscription.customCycleMonths,
  );
  return round2(getPerPersonCyclePrice(subscription) / cycleMonths);
}

export function getSubscriptionYearlyAmount(subscription: Subscription): number {
  return round2(getSubscriptionMonthlyAmount(subscription) * 12);
}

export function summarizeByCurrency(subscriptions: readonly Subscription[]) {
  const summary: Record<
    SubscriptionCurrency,
    { monthly: number; yearly: number }
  > = {
    KRW: { monthly: 0, yearly: 0 },
    USD: { monthly: 0, yearly: 0 },
    JPY: { monthly: 0, yearly: 0 },
  };

  subscriptions.forEach((subscription) => {
    const monthly = getSubscriptionMonthlyAmount(subscription);
    summary[subscription.currency].monthly += monthly;
    summary[subscription.currency].yearly += monthly * 12;
  });

  return summary;
}

export function formatMoney(
  value: number,
  currency: SubscriptionCurrency,
): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2,
  }).format(value);
}

export function getNextPaymentDate(
  subscription: Subscription,
  now: Date = new Date(),
): string | null {
  if (!isValidDateString(subscription.billingStartDate)) return null;

  const cycleMonths = getCycleMonths(
    subscription.billingCycle,
    subscription.customCycleMonths,
  );

  const nowDate = parseDate(getLocalToday(now));
  let next = parseDate(subscription.billingStartDate);

  while (next <= nowDate) {
    next = addMonths(next, cycleMonths);
  }

  return formatDate(next);
}

export function getDisplayedNextPaymentDate(
  subscription: Subscription,
  now: Date = new Date(),
): { date: string | null; reason: "next_payment" | "end_date" | "none" } {
  const nextPayment = getNextPaymentDate(subscription, now);
  const endDate = isValidDateString(subscription.endDate)
    ? subscription.endDate
    : null;

  if (!nextPayment && endDate) {
    return { date: endDate, reason: "end_date" };
  }
  if (!nextPayment) {
    return { date: null, reason: "none" };
  }
  if (endDate && nextPayment >= endDate) {
    return { date: endDate, reason: "end_date" };
  }
  return { date: nextPayment, reason: "next_payment" };
}

export function getCycleProgress(
  subscription: Subscription,
  now: Date = new Date(),
): number {
  if (!isValidDateString(subscription.billingStartDate)) return 0;

  const cycleMonths = getCycleMonths(
    subscription.billingCycle,
    subscription.customCycleMonths,
  );

  const today = parseDate(getLocalToday(now));
  let periodStart = parseDate(subscription.billingStartDate);

  while (addMonths(periodStart, cycleMonths) <= today) {
    periodStart = addMonths(periodStart, cycleMonths);
  }

  const periodEnd = addMonths(periodStart, cycleMonths);
  const totalMs = periodEnd.getTime() - periodStart.getTime();
  const elapsedMs = today.getTime() - periodStart.getTime();

  if (totalMs <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
}

export function getCycleLabel(
  billingCycle: BillingCycle,
  customCycleMonths: number | null,
): string {
  if (billingCycle === "monthly") return "한달";
  if (billingCycle === "yearly") return "연간";
  return `${customCycleMonths ?? 1}개월 주기`;
}

export function getCyclePaymentLabel(
  billingCycle: BillingCycle,
  customCycleMonths: number | null,
): string {
  if (billingCycle === "monthly") return "1개월";
  if (billingCycle === "yearly") return "연간";
  return `${customCycleMonths ?? 1}개월`;
}

import { SUBSCRIPTIONS_STORAGE_KEY } from "@/lib/constants";
import {
  createLocalStorageStore,
  notifyStorageChange,
} from "@/lib/storage/localStorageStore";
import type {
  BillingCycle,
  Subscription,
  SubscriptionCategory,
  SubscriptionCurrency,
} from "@/types/subscription";

const fallback: readonly Subscription[] = [];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const VALID_CATEGORIES: readonly SubscriptionCategory[] = [
  "ott",
  "ai",
  "shopping",
  "music",
  "reading",
  "other",
];
const VALID_CURRENCIES: readonly SubscriptionCurrency[] = ["KRW", "USD", "JPY"];
const VALID_BILLING_CYCLES: readonly BillingCycle[] = [
  "monthly",
  "custom",
  "yearly",
];

function getNowDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getNowIso(): string {
  return new Date().toISOString();
}

function parseNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseDateString(value: unknown): string | null {
  const parsed = parseString(value);
  return parsed && DATE_REGEX.test(parsed) ? parsed : null;
}

function toId(value: unknown): string {
  const parsed = parseString(value);
  if (parsed && parsed.trim()) return parsed;
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sub-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function normalizeCategory(value: unknown): SubscriptionCategory {
  const parsed = parseString(value);
  if (parsed && VALID_CATEGORIES.includes(parsed as SubscriptionCategory)) {
    return parsed as SubscriptionCategory;
  }
  return "other";
}

function normalizeCurrency(value: unknown): SubscriptionCurrency {
  const parsed = parseString(value);
  if (parsed && VALID_CURRENCIES.includes(parsed as SubscriptionCurrency)) {
    return parsed as SubscriptionCurrency;
  }
  return "KRW";
}

function normalizeBillingCycle(value: unknown): BillingCycle {
  const parsed = parseString(value);
  if (parsed && VALID_BILLING_CYCLES.includes(parsed as BillingCycle)) {
    return parsed as BillingCycle;
  }
  return "monthly";
}

function normalizeLegacyAccountCharge(
  account: unknown,
  defaultPrice: number,
): number {
  if (!account || typeof account !== "object") return defaultPrice;
  const record = account as Record<string, unknown>;

  const customPrice = parseNumber(record.customPrice);
  if (customPrice !== null) return Math.max(customPrice, 0);

  const discountType = parseString(record.discountType) ?? "none";
  const discountRate =
    discountType === "percent30"
      ? 0.3
      : discountType === "percent50"
        ? 0.5
        : discountType === "free"
          ? 1
          : 0;
  return Math.max(defaultPrice * (1 - discountRate), 0);
}

function deriveActualPrice(
  source: Record<string, unknown>,
  defaultPrice: number,
): number {
  const directPrice = parseNumber(source.actualPrice);
  if (directPrice !== null) return Math.max(directPrice, 0);

  const legacyAccounts = Array.isArray(source.accounts) ? source.accounts : [];
  if (legacyAccounts.length > 0) {
    const sum = legacyAccounts.reduce((acc, account) => {
      return acc + normalizeLegacyAccountCharge(account, defaultPrice);
    }, 0);
    return Math.max(Math.round(sum * 100) / 100, 0);
  }

  const legacyBasePrice = parseNumber(source.basePrice);
  if (legacyBasePrice !== null) return Math.max(legacyBasePrice, 0);

  return defaultPrice;
}

function deriveAccountName(source: Record<string, unknown>): string {
  const accountName = parseString(source.accountName);
  if (accountName && accountName.trim()) return accountName.trim();

  const legacyAccounts = Array.isArray(source.accounts) ? source.accounts : [];
  if (legacyAccounts.length > 0 && legacyAccounts[0] && typeof legacyAccounts[0] === "object") {
    const alias = parseString((legacyAccounts[0] as Record<string, unknown>).alias);
    if (alias && alias.trim()) return alias.trim();
  }

  const memo = parseString(source.memo);
  if (memo && memo.trim()) return memo.trim();

  return "";
}

function deriveCustomCycleMonths(
  source: Record<string, unknown>,
  billingCycle: BillingCycle,
  billingStartDate: string,
): number | null {
  if (billingCycle !== "custom") return null;

  const direct = parseNumber(source.customCycleMonths);
  if (direct !== null && direct > 0) return Math.floor(direct);

  const legacyDays = parseNumber(source.customCycleDays);
  if (legacyDays !== null && legacyDays > 0) {
    return Math.max(1, Math.round(legacyDays / 30));
  }

  const legacyEndDate = parseDateString(source.customCycleEndDate);
  if (legacyEndDate) {
    const start = new Date(`${billingStartDate}T00:00:00`);
    const end = new Date(`${legacyEndDate}T00:00:00`);
    if (end > start) {
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      return Math.max(1, Math.round(diffDays / 30));
    }
  }

  return 1;
}

function deriveParticipantCount(source: Record<string, unknown>): number {
  const direct = parseNumber(source.participantCount);
  if (direct !== null && direct > 0) return Math.floor(direct);

  const legacyAccounts = Array.isArray(source.accounts) ? source.accounts : [];
  if (legacyAccounts.length > 0) return legacyAccounts.length;

  return 1;
}

export function normalizeSubscriptionRecord(raw: unknown): Subscription | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;

  const defaultPriceRaw = parseNumber(source.defaultPrice);
  const legacyBasePrice = parseNumber(source.basePrice);
  const defaultPrice = Math.max(defaultPriceRaw ?? legacyBasePrice ?? 0, 0);

  const billingStartDate =
    parseDateString(source.billingStartDate) ??
    parseDateString(source.billingAnchorDate) ??
    getNowDate();

  const billingCycle = normalizeBillingCycle(source.billingCycle);
  const customCycleMonths = deriveCustomCycleMonths(
    source,
    billingCycle,
    billingStartDate,
  );

  return {
    id: toId(source.id),
    serviceKey: parseString(source.serviceKey)?.trim() || "custom-service",
    serviceName: parseString(source.serviceName)?.trim() || "이름없는 서비스",
    category: normalizeCategory(source.category),
    logoUrl: parseString(source.logoUrl)?.trim() || "",
    defaultPrice,
    actualPrice: deriveActualPrice(source, defaultPrice),
    participantCount: deriveParticipantCount(source),
    currency: normalizeCurrency(source.currency),
    billingCycle,
    customCycleMonths,
    billingStartDate,
    endDate:
      parseDateString(source.endDate) ??
      parseDateString(source.expectedEndDate) ??
      null,
    accountName: deriveAccountName(source),
    memo: parseString(source.memo)?.trim() || "",
    createdAt: parseString(source.createdAt) ?? getNowIso(),
    updatedAt: parseString(source.updatedAt) ?? getNowIso(),
    basePrice: legacyBasePrice ?? undefined,
    billingAnchorDate: parseDateString(source.billingAnchorDate) ?? undefined,
    expectedEndDate: parseDateString(source.expectedEndDate),
    customCycleEndDate: parseDateString(source.customCycleEndDate),
    customCycleDays: parseNumber(source.customCycleDays),
    autoRenew:
      typeof source.autoRenew === "boolean" ? source.autoRenew : undefined,
    accounts: Array.isArray(source.accounts)
      ? (source.accounts as Subscription["accounts"])
      : undefined,
  };
}

function parseSubscriptions(raw: string): readonly Subscription[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed
      .map((item) => normalizeSubscriptionRecord(item))
      .filter((item): item is Subscription => item !== null);
  } catch {
    return fallback;
  }
}

export const subscriptionStore = createLocalStorageStore<readonly Subscription[]>(
  SUBSCRIPTIONS_STORAGE_KEY,
  parseSubscriptions,
  fallback,
);

export function listSubscriptions(): readonly Subscription[] {
  return subscriptionStore.getSnapshot();
}

export function upsertSubscription(nextSubscription: Subscription): void {
  if (typeof window === "undefined") return;

  try {
    const current = listSubscriptions();
    const index = current.findIndex((item) => item.id === nextSubscription.id);

    const next =
      index >= 0
        ? current.map((item) =>
            item.id === nextSubscription.id ? nextSubscription : item,
          )
        : [...current, nextSubscription];

    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(next));
    notifyStorageChange(SUBSCRIPTIONS_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to upsert subscription:", error);
  }
}

export function deleteSubscription(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const current = listSubscriptions();
    const next = current.filter((item) => item.id !== id);
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(next));
    notifyStorageChange(SUBSCRIPTIONS_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to delete subscription:", error);
  }
}

import { upsertBudget } from "@/lib/budget/budgetRepository";
import { SUBSCRIPTION_PRESETS } from "@/lib/subscriptions/presets";
import {
  deleteSubscription,
  listSubscriptions,
  upsertSubscription,
} from "@/lib/subscriptions/subscriptionRepository";
import type { Transaction } from "@/types/budget";
import type { Subscription } from "@/types/subscription";
import {
  DASHBOARD_PRESETS,
  DASHBOARD_PRESET_STORAGE_KEY,
  PRESET_SUBSCRIPTION_ID_PREFIX,
  PRESET_TRANSACTION_PREFIX,
  type DashboardPresetId,
} from "./dashboardPresets";

interface ApplyPresetResult {
  readonly transactions: readonly Transaction[];
  readonly presetLabel: string;
}

function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function buildPresetIncomeTransaction(
  presetId: DashboardPresetId,
): Transaction {
  const preset = DASHBOARD_PRESETS[presetId];
  const today = getToday();
  const nowIso = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    type: preset.income.type,
    amount: preset.income.amount,
    category: preset.income.category,
    description: `${PRESET_TRANSACTION_PREFIX}:${preset.label} ${preset.income.description}`,
    date: today,
    createdAt: nowIso,
  };
}

function buildPresetSubscription(
  presetId: DashboardPresetId,
  presetServiceKey: string,
): Subscription | null {
  const service = SUBSCRIPTION_PRESETS.find(
    (item) => item.key === presetServiceKey,
  );
  if (!service) return null;

  const nowIso = new Date().toISOString();
  const today = getToday();
  const preset = DASHBOARD_PRESETS[presetId];

  return {
    id: `${PRESET_SUBSCRIPTION_ID_PREFIX}${presetId}-${service.key}`,
    serviceKey: service.key,
    serviceName: service.name,
    category: service.category,
    logoUrl: service.logoUrl,
    defaultPrice: service.defaultPrice,
    actualPrice: service.defaultPrice,
    participantCount: 1,
    currency: service.currency,
    billingCycle: "monthly",
    customCycleMonths: null,
    billingStartDate: today,
    endDate: null,
    accountName: `${preset.label} 기본`,
    memo: `${PRESET_TRANSACTION_PREFIX}:${preset.label} 기본 구독`,
    createdAt: nowIso,
    updatedAt: nowIso,
    basePrice: service.defaultPrice,
    billingAnchorDate: today,
    expectedEndDate: null,
    customCycleEndDate: null,
    customCycleDays: null,
    autoRenew: true,
    accounts: undefined,
  };
}

function replacePresetSubscriptions(presetId: DashboardPresetId): void {
  const existing = listSubscriptions();
  existing
    .filter((subscription) =>
      subscription.id.startsWith(PRESET_SUBSCRIPTION_ID_PREFIX),
    )
    .forEach((subscription) => {
      deleteSubscription(subscription.id);
    });

  DASHBOARD_PRESETS[presetId].subscriptionKeys.forEach((key) => {
    const next = buildPresetSubscription(presetId, key);
    if (next) upsertSubscription(next);
  });
}

export function applyDashboardPreset(
  presetId: DashboardPresetId,
  currentTransactions: readonly Transaction[],
): ApplyPresetResult {
  const preset = DASHBOARD_PRESETS[presetId];

  const filteredTransactions = currentTransactions.filter(
    (transaction) =>
      !transaction.description.startsWith(`${PRESET_TRANSACTION_PREFIX}:`),
  );

  const nextTransactions = [
    ...filteredTransactions,
    buildPresetIncomeTransaction(presetId),
  ];

  void upsertBudget(getCurrentMonth(), { ...preset.budgets }).catch((error) => {
    console.error("Failed to apply preset budget:", error);
  });
  replacePresetSubscriptions(presetId);

  if (typeof window !== "undefined") {
    localStorage.setItem(DASHBOARD_PRESET_STORAGE_KEY, presetId);
  }

  return {
    transactions: nextTransactions,
    presetLabel: preset.label,
  };
}

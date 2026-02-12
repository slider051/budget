import {
  SUBSCRIPTION_PRESETS,
} from "@/lib/subscriptions/presets";
import type {
  BillingCycle,
  Subscription,
  SubscriptionCategory,
  SubscriptionCurrency,
} from "@/types/subscription";

export interface SubscriptionFormState {
  serviceKey: string;
  serviceName: string;
  category: SubscriptionCategory;
  logoUrl: string;
  defaultPrice: string;
  actualPrice: string;
  participantCount: string;
  currency: SubscriptionCurrency;
  billingCycle: BillingCycle;
  customCycleMonths: string;
  billingStartDate: string;
  endDate: string;
  accountName: string;
  memo: string;
}

export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createInitialFormState(): SubscriptionFormState {
  const preset = SUBSCRIPTION_PRESETS[0];
  return {
    serviceKey: preset.key,
    serviceName: preset.name,
    category: preset.category,
    logoUrl: preset.logoUrl,
    defaultPrice: String(preset.defaultPrice),
    actualPrice: String(preset.defaultPrice),
    participantCount: "1",
    currency: preset.currency,
    billingCycle: "monthly",
    customCycleMonths: "6",
    billingStartDate: getTodayDate(),
    endDate: "",
    accountName: "",
    memo: "",
  };
}

export function mapSubscriptionToForm(
  subscription: Subscription,
): SubscriptionFormState {
  return {
    serviceKey: subscription.serviceKey,
    serviceName: subscription.serviceName,
    category: subscription.category,
    logoUrl: subscription.logoUrl,
    defaultPrice: String(subscription.defaultPrice),
    actualPrice: String(subscription.actualPrice),
    participantCount: String(subscription.participantCount),
    currency: subscription.currency,
    billingCycle: subscription.billingCycle,
    customCycleMonths:
      subscription.customCycleMonths === null
        ? "6"
        : String(subscription.customCycleMonths),
    billingStartDate: subscription.billingStartDate,
    endDate: subscription.endDate ?? "",
    accountName: subscription.accountName,
    memo: subscription.memo,
  };
}

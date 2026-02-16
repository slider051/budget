import {
  getTodayDate,
  type SubscriptionFormState,
} from "@/components/subscriptions/subscriptionFormState";
import type { Subscription } from "@/types/subscription";

export type SubscriptionsTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function createPreviewSubscription(
  form: SubscriptionFormState,
): Subscription {
  const cycle = form.billingCycle;
  const customCycleMonths =
    cycle === "custom"
      ? Math.max(Math.floor(Number(form.customCycleMonths) || 1), 1)
      : null;

  return {
    id: "preview",
    serviceKey: form.serviceKey,
    serviceName: form.serviceName,
    category: form.category,
    logoUrl: form.logoUrl,
    defaultPrice: Number(form.defaultPrice) || 0,
    actualPrice: Number(form.actualPrice) || 0,
    participantCount: Math.max(Math.floor(Number(form.participantCount) || 1), 1),
    currency: form.currency,
    billingCycle: cycle,
    customCycleMonths,
    billingStartDate: form.billingStartDate || getTodayDate(),
    endDate: form.endDate || null,
    accountName: form.accountName,
    memo: form.memo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function validateSubscriptionForm(
  form: SubscriptionFormState,
  t: SubscriptionsTranslator,
): string | null {
  const parsedDefaultPrice = Number(form.defaultPrice);
  const parsedActualPrice = Number(form.actualPrice);
  const parsedParticipantCount = Number(form.participantCount);
  const parsedCustomMonths = Number(form.customCycleMonths);

  if (!form.serviceName.trim()) return t("validationServiceName");
  if (!Number.isFinite(parsedDefaultPrice) || parsedDefaultPrice < 0) {
    return t("validationDefaultPrice");
  }
  if (!Number.isFinite(parsedActualPrice) || parsedActualPrice < 0) {
    return t("validationActualPrice");
  }
  if (!Number.isFinite(parsedParticipantCount) || parsedParticipantCount <= 0) {
    return t("validationParticipant");
  }
  if (!form.billingStartDate) return t("validationStartDate");
  if (
    form.billingCycle === "custom" &&
    (!Number.isFinite(parsedCustomMonths) || parsedCustomMonths <= 0)
  ) {
    return t("validationCustomCycle");
  }
  if (form.endDate && form.endDate < form.billingStartDate) {
    return t("validationEndDate");
  }

  return null;
}

interface BuildSubscriptionPayloadParams {
  readonly form: SubscriptionFormState;
  readonly editingId: string | null;
  readonly subscriptions: readonly Subscription[];
}

export function buildSubscriptionPayload({
  form,
  editingId,
  subscriptions,
}: BuildSubscriptionPayloadParams): Subscription {
  const parsedDefaultPrice = Number(form.defaultPrice);
  const parsedActualPrice = Number(form.actualPrice);
  const parsedParticipantCount = Number(form.participantCount);
  const parsedCustomMonths = Number(form.customCycleMonths);
  const existing = editingId
    ? subscriptions.find((item) => item.id === editingId)
    : undefined;
  const timestamp = new Date().toISOString();

  return {
    id: editingId ?? crypto.randomUUID(),
    serviceKey: form.serviceKey,
    serviceName: form.serviceName.trim(),
    category: form.category,
    logoUrl: form.logoUrl.trim(),
    defaultPrice: parsedDefaultPrice,
    actualPrice: parsedActualPrice,
    participantCount: Math.max(Math.floor(parsedParticipantCount), 1),
    currency: form.currency,
    billingCycle: form.billingCycle,
    customCycleMonths:
      form.billingCycle === "custom" ? Math.floor(parsedCustomMonths) : null,
    billingStartDate: form.billingStartDate,
    endDate: form.endDate || null,
    accountName: form.accountName.trim(),
    memo: form.memo.trim(),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    basePrice: parsedDefaultPrice,
    billingAnchorDate: form.billingStartDate,
    expectedEndDate: form.endDate || null,
    customCycleEndDate: null,
    customCycleDays: null,
    autoRenew: true,
    accounts: undefined,
  };
}

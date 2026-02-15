"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import {
  CUSTOM_SERVICE_KEY,
  SubscriptionForm,
} from "@/components/subscriptions/SubscriptionForm";
import {
  createInitialFormState,
  getTodayDate,
  mapSubscriptionToForm,
  type SubscriptionFormState,
} from "@/components/subscriptions/subscriptionFormState";
import Card from "@/components/ui/Card";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import {
  formatMoney,
  getCyclePaymentLabel,
  getDisplayedNextPaymentDate,
  getPerPersonCyclePrice,
  summarizeByCurrency,
} from "@/lib/subscriptions/calculations";
import { SUBSCRIPTION_PRESETS } from "@/lib/subscriptions/presets";
import type { Subscription } from "@/types/subscription";

function createPreviewSubscription(form: SubscriptionFormState): Subscription {
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
    participantCount: Math.max(
      Math.floor(Number(form.participantCount) || 1),
      1,
    ),
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

export default function SubscriptionsPage() {
  const t = useTranslations("subscriptions");
  const {
    subscriptions,
    isLoading,
    error: loadError,
    upsertSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const [form, setForm] = useState<SubscriptionFormState>(
    createInitialFormState,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});
  const [memoOpenMap, setMemoOpenMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const summary = useMemo(
    () => summarizeByCurrency(subscriptions),
    [subscriptions],
  );

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const aNext = getDisplayedNextPaymentDate(a).date ?? "9999-12-31";
      const bNext = getDisplayedNextPaymentDate(b).date ?? "9999-12-31";
      return aNext.localeCompare(bNext);
    });
  }, [subscriptions]);

  const previewSubscription = useMemo(
    () => createPreviewSubscription(form),
    [form],
  );
  const previewDateInfo = useMemo(
    () => getDisplayedNextPaymentDate(previewSubscription),
    [previewSubscription],
  );
  const previewDateLabel =
    previewDateInfo.reason === "end_date" ? t("expiry") : t("nextPayment");
  const previewCycleLabel = getCyclePaymentLabel(
    previewSubscription.billingCycle,
    previewSubscription.customCycleMonths,
  );
  const previewPaymentText = formatMoney(
    getPerPersonCyclePrice(previewSubscription),
    previewSubscription.currency,
  );

  const resetForm = useCallback(() => {
    setForm(createInitialFormState());
    setEditingId(null);
    setErrorMessage(null);
  }, []);

  const handlePresetChange = useCallback((nextServiceKey: string) => {
    if (nextServiceKey === CUSTOM_SERVICE_KEY) {
      setForm((prev) => ({
        ...prev,
        serviceKey: CUSTOM_SERVICE_KEY,
      }));
      return;
    }

    const preset = SUBSCRIPTION_PRESETS.find(
      (item) => item.key === nextServiceKey,
    );
    if (!preset) return;

    setForm((prev) => ({
      ...prev,
      serviceKey: preset.key,
      serviceName: preset.name,
      category: preset.category,
      logoUrl: preset.logoUrl,
      defaultPrice: String(preset.defaultPrice),
      currency: preset.currency,
    }));
  }, []);

  const handleToggleMemo = useCallback((id: string) => {
    setMemoOpenMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleLogoError = useCallback((id: string) => {
    setLogoError((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleEdit = useCallback((subscription: Subscription) => {
    setForm(mapSubscriptionToForm(subscription));
    setEditingId(subscription.id);
    setErrorMessage(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);

      const parsedDefaultPrice = Number(form.defaultPrice);
      const parsedActualPrice = Number(form.actualPrice);
      const parsedParticipantCount = Number(form.participantCount);
      const parsedCustomMonths = Number(form.customCycleMonths);

      if (!form.serviceName.trim()) {
        setErrorMessage(t("validationServiceName"));
        return;
      }
      if (!Number.isFinite(parsedDefaultPrice) || parsedDefaultPrice < 0) {
        setErrorMessage(t("validationDefaultPrice"));
        return;
      }
      if (!Number.isFinite(parsedActualPrice) || parsedActualPrice < 0) {
        setErrorMessage(t("validationActualPrice"));
        return;
      }
      if (
        !Number.isFinite(parsedParticipantCount) ||
        parsedParticipantCount <= 0
      ) {
        setErrorMessage(t("validationParticipant"));
        return;
      }
      if (!form.billingStartDate) {
        setErrorMessage(t("validationStartDate"));
        return;
      }
      if (
        form.billingCycle === "custom" &&
        (!Number.isFinite(parsedCustomMonths) || parsedCustomMonths <= 0)
      ) {
        setErrorMessage(t("validationCustomCycle"));
        return;
      }
      if (form.endDate && form.endDate < form.billingStartDate) {
        setErrorMessage(t("validationEndDate"));
        return;
      }

      const existing = editingId
        ? subscriptions.find((item) => item.id === editingId)
        : undefined;
      const timestamp = new Date().toISOString();

      const nextSubscription: Subscription = {
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
          form.billingCycle === "custom"
            ? Math.floor(parsedCustomMonths)
            : null,
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

      try {
        setIsSubmitting(true);
        await upsertSubscription(nextSubscription);
        resetForm();
      } catch (error) {
        const message = error instanceof Error ? error.message : t("saveError");
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingId, form, resetForm, subscriptions, upsertSubscription, t],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm(t("deleteConfirm"))) {
        return;
      }

      try {
        setDeletingId(id);
        await deleteSubscription(id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("deleteError");
        setErrorMessage(message);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteSubscription, t],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t("description")}
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(["KRW", "USD", "JPY"] as const).map((currency) => (
          <Card key={currency} className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("monthlyTotal")} ({currency})
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {formatMoney(summary[currency].monthly, currency)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("yearlyTotal")}{" "}
              {formatMoney(summary[currency].yearly, currency)}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <SubscriptionForm
          form={form}
          editingId={editingId}
          errorMessage={errorMessage}
          previewPaymentText={previewPaymentText}
          previewCycleLabel={previewCycleLabel}
          previewDateLabel={previewDateLabel}
          previewDate={previewDateInfo.date}
          onSubmit={handleSubmit}
          onReset={resetForm}
          onPresetChange={handlePresetChange}
          setForm={setForm}
          isSubmitting={isSubmitting}
        />
      </Card>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("registered")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("totalCount", { count: subscriptions.length })}
            </p>
          </div>

          {isLoading && (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {t("loadingData")}
            </div>
          )}

          {!isLoading && sortedSubscriptions.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {t("noSubscriptions")}
            </div>
          )}

          {!isLoading && sortedSubscriptions.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sortedSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  isLogoBroken={logoError[subscription.id] ?? false}
                  isMemoOpen={memoOpenMap[subscription.id] ?? false}
                  onLogoError={handleLogoError}
                  onToggleMemo={handleToggleMemo}
                  onEdit={handleEdit}
                  onDelete={() => {
                    if (deletingId) return;
                    void handleDelete(subscription.id);
                  }}
                  isDeleting={deletingId === subscription.id}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

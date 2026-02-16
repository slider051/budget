"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { CUSTOM_SERVICE_KEY } from "@/components/subscriptions/SubscriptionForm";
import {
  createInitialFormState,
  mapSubscriptionToForm,
  type SubscriptionFormState,
} from "@/components/subscriptions/subscriptionFormState";
import {
  buildSubscriptionPayload,
  createPreviewSubscription,
  type SubscriptionsTranslator,
  validateSubscriptionForm,
} from "@/components/subscriptions/subscriptionEditorUtils";
import {
  formatMoney,
  getCyclePaymentLabel,
  getDisplayedNextPaymentDate,
  getPerPersonCyclePrice,
} from "@/lib/subscriptions/calculations";
import { SUBSCRIPTION_PRESETS } from "@/lib/subscriptions/presets";
import type { Subscription } from "@/types/subscription";

interface UseSubscriptionEditorArgs {
  readonly subscriptions: readonly Subscription[];
  readonly t: SubscriptionsTranslator;
  readonly upsertSubscription: (subscription: Subscription) => Promise<void>;
  readonly deleteSubscription: (id: string) => Promise<void>;
}

export function useSubscriptionEditor({
  subscriptions,
  t,
  upsertSubscription,
  deleteSubscription,
}: UseSubscriptionEditorArgs) {
  const [form, setForm] = useState<SubscriptionFormState>(createInitialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});
  const [memoOpenMap, setMemoOpenMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      setForm((prev) => ({ ...prev, serviceKey: CUSTOM_SERVICE_KEY }));
      return;
    }

    const preset = SUBSCRIPTION_PRESETS.find((item) => item.key === nextServiceKey);
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
    setMemoOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
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
    async (e: FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);

      const validationError = validateSubscriptionForm(form, t);
      if (validationError) {
        setErrorMessage(validationError);
        return;
      }

      const payload = buildSubscriptionPayload({
        form,
        editingId,
        subscriptions,
      });

      try {
        setIsSubmitting(true);
        await upsertSubscription(payload);
        resetForm();
      } catch (error) {
        const message = error instanceof Error ? error.message : t("saveError");
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingId, form, resetForm, subscriptions, t, upsertSubscription],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm(t("deleteConfirm"))) return;

      try {
        setDeletingId(id);
        await deleteSubscription(id);
      } catch (error) {
        const message = error instanceof Error ? error.message : t("deleteError");
        setErrorMessage(message);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteSubscription, t],
  );

  return {
    form,
    setForm,
    editingId,
    errorMessage,
    logoError,
    memoOpenMap,
    isSubmitting,
    deletingId,
    previewPaymentText,
    previewCycleLabel,
    previewDateLabel,
    previewDate: previewDateInfo.date,
    handlePresetChange,
    handleToggleMemo,
    handleLogoError,
    handleEdit,
    handleSubmit,
    handleDelete,
    resetForm,
  };
}

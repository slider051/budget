"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import type { SubscriptionFormState } from "./subscriptionFormState";
import {
  AdditionalInfoSection,
  BasicInfoSection,
  PaymentInfoSection,
  PreviewPanel,
} from "./SubscriptionFormSections";

export const CUSTOM_SERVICE_KEY = "__custom__";

interface SubscriptionFormProps {
  form: SubscriptionFormState;
  editingId: string | null;
  errorMessage: string | null;
  previewPaymentText: string;
  previewCycleLabel: string;
  previewDateLabel: string;
  previewDate: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onPresetChange: (serviceKey: string) => void;
  setForm: React.Dispatch<React.SetStateAction<SubscriptionFormState>>;
}

export function SubscriptionForm({
  form,
  editingId,
  errorMessage,
  previewPaymentText,
  previewCycleLabel,
  previewDateLabel,
  previewDate,
  isSubmitting,
  onSubmit,
  onReset,
  onPresetChange,
  setForm,
}: SubscriptionFormProps) {
  const t = useTranslations("subscriptions");
  const patch = (next: Partial<SubscriptionFormState>) =>
    setForm((prev) => ({ ...prev, ...next }));

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {editingId ? t("editSub") : t("addSub")}
        </h2>
        {editingId ? (
          <Button type="button" variant="outline" onClick={onReset}>
            {t("cancelEdit")}
          </Button>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <BasicInfoSection
        form={form}
        patch={patch}
        onPresetChange={onPresetChange}
        customServiceKey={CUSTOM_SERVICE_KEY}
        labels={{
          basicInfo: t("basicInfo"),
          servicePreset: t("servicePreset"),
          serviceName: t("serviceName"),
          customInput: t("customInput"),
        }}
      />

      <PaymentInfoSection
        form={form}
        patch={patch}
        labels={{
          paymentInfo: t("paymentInfo"),
          categoryLabel: t("categoryLabel"),
          currency: t("currency"),
          defaultPrice: t("defaultPrice"),
          actualPrice: t("actualPrice"),
          participantCount: t("participantCount"),
          billingStart: t("billingStart"),
          billingCycle: t("billingCycle"),
          cycleMonthly: t("cycleMonthly"),
          cycleYearly: t("cycleYearly"),
          cycleCustom: t("cycleCustom"),
          endDateOptional: t("endDateOptional"),
          customCycleMonths: t("customCycleMonths"),
        }}
      />

      <AdditionalInfoSection
        form={form}
        patch={patch}
        labels={{
          additionalInfo: t("additionalInfo"),
          accountName: t("accountName"),
          accountNamePlaceholder: t("accountNamePlaceholder"),
          logoUrl: t("logoUrl"),
          memoOptional: t("memoOptional"),
        }}
      />

      <PreviewPanel
        title={t("preview")}
        content={t("perPersonPrice", {
          price: previewPaymentText,
          cycle: previewCycleLabel,
        })}
        dateLabel={previewDateLabel}
        date={previewDate}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("submitting") : editingId ? t("submitUpdate") : t("submitAdd")}
      </Button>
    </form>
  );
}

"use client";

import { CATEGORY_LABELS, CURRENCY_LABELS, SUBSCRIPTION_PRESETS } from "@/lib/subscriptions/presets";
import type { BillingCycle, SubscriptionCategory, SubscriptionCurrency } from "@/types/subscription";
import type { SubscriptionFormState } from "./subscriptionFormState";

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100";

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
      {children}
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  );
}

interface SharedProps {
  form: SubscriptionFormState;
  patch: (next: Partial<SubscriptionFormState>) => void;
}

export function BasicInfoSection({
  form,
  patch,
  onPresetChange,
  labels,
  customServiceKey,
}: SharedProps & {
  onPresetChange: (serviceKey: string) => void;
  labels: { basicInfo: string; servicePreset: string; serviceName: string; customInput: string };
  customServiceKey: string;
}) {
  return (
    <FormSection title={labels.basicInfo}>
      <div className="grid gap-4 md:grid-cols-2">
        <Labeled label={labels.servicePreset}>
          <select value={form.serviceKey} onChange={(e) => onPresetChange(e.target.value)} className={fieldClass}>
            {SUBSCRIPTION_PRESETS.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.name}
              </option>
            ))}
            <option value={customServiceKey}>{labels.customInput}</option>
          </select>
        </Labeled>
        <Labeled label={labels.serviceName}>
          <input value={form.serviceName} onChange={(e) => patch({ serviceName: e.target.value })} className={fieldClass} />
        </Labeled>
      </div>
    </FormSection>
  );
}

export function PaymentInfoSection({
  form,
  patch,
  labels,
}: SharedProps & {
  labels: {
    paymentInfo: string;
    categoryLabel: string;
    currency: string;
    defaultPrice: string;
    actualPrice: string;
    participantCount: string;
    billingStart: string;
    billingCycle: string;
    cycleMonthly: string;
    cycleYearly: string;
    cycleCustom: string;
    endDateOptional: string;
    customCycleMonths: string;
  };
}) {
  return (
    <FormSection title={labels.paymentInfo}>
      <div className="grid gap-4 md:grid-cols-4">
        <Labeled label={labels.categoryLabel}>
          <select value={form.category} onChange={(e) => patch({ category: e.target.value as SubscriptionCategory })} className={fieldClass}>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Labeled>
        <Labeled label={labels.currency}>
          <select value={form.currency} onChange={(e) => patch({ currency: e.target.value as SubscriptionCurrency })} className={fieldClass}>
            {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Labeled>
        <Labeled label={labels.defaultPrice}>
          <input type="number" min={0} step="0.01" value={form.defaultPrice} onChange={(e) => patch({ defaultPrice: e.target.value })} className={fieldClass} />
        </Labeled>
        <Labeled label={labels.actualPrice}>
          <input type="number" min={0} step="0.01" value={form.actualPrice} onChange={(e) => patch({ actualPrice: e.target.value })} className={fieldClass} />
        </Labeled>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Labeled label={labels.participantCount}>
          <input type="number" min={1} value={form.participantCount} onChange={(e) => patch({ participantCount: e.target.value })} className={fieldClass} />
        </Labeled>
        <Labeled label={labels.billingStart}>
          <input type="date" value={form.billingStartDate} onChange={(e) => patch({ billingStartDate: e.target.value })} className={fieldClass} />
        </Labeled>
        <Labeled label={labels.billingCycle}>
          <select value={form.billingCycle} onChange={(e) => patch({ billingCycle: e.target.value as BillingCycle })} className={fieldClass}>
            <option value="monthly">{labels.cycleMonthly}</option>
            <option value="yearly">{labels.cycleYearly}</option>
            <option value="custom">{labels.cycleCustom}</option>
          </select>
        </Labeled>
        <Labeled label={labels.endDateOptional}>
          <input type="date" value={form.endDate} onChange={(e) => patch({ endDate: e.target.value })} className={fieldClass} />
        </Labeled>
      </div>

      {form.billingCycle === "custom" ? (
        <div className="mt-4 max-w-xs">
          <Labeled label={labels.customCycleMonths}>
            <input type="number" min={1} value={form.customCycleMonths} onChange={(e) => patch({ customCycleMonths: e.target.value })} className={fieldClass} />
          </Labeled>
        </div>
      ) : null}
    </FormSection>
  );
}

export function AdditionalInfoSection({
  form,
  patch,
  labels,
}: SharedProps & {
  labels: { additionalInfo: string; accountName: string; accountNamePlaceholder: string; logoUrl: string; memoOptional: string };
}) {
  return (
    <FormSection title={labels.additionalInfo}>
      <div className="grid gap-4 md:grid-cols-2">
        <Labeled label={labels.accountName}>
          <input value={form.accountName} onChange={(e) => patch({ accountName: e.target.value })} placeholder={labels.accountNamePlaceholder} className={fieldClass} />
        </Labeled>
        <Labeled label={labels.logoUrl}>
          <input value={form.logoUrl} onChange={(e) => patch({ logoUrl: e.target.value })} placeholder="https://..." className={fieldClass} />
        </Labeled>
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">{labels.memoOptional}</span>
        <textarea value={form.memo} onChange={(e) => patch({ memo: e.target.value })} rows={2} className={fieldClass} />
      </label>
    </FormSection>
  );
}

export function PreviewPanel({
  title,
  content,
  dateLabel,
  date,
}: {
  title: string;
  content: string;
  dateLabel: string;
  date: string | null;
}) {
  return (
    <div className="rounded-lg border border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
      <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">{title}</p>
      <p className="mt-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">{content}</p>
      <div className="mt-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
        {dateLabel}: {date ?? "-"}
      </div>
    </div>
  );
}

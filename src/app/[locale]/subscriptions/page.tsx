"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { useSubscriptionEditor } from "@/components/subscriptions/useSubscriptionEditor";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import {
  formatMoney,
  getDisplayedNextPaymentDate,
  summarizeByCurrency,
} from "@/lib/subscriptions/calculations";

export default function SubscriptionsPage() {
  const t = useTranslations("subscriptions");
  const {
    subscriptions,
    isLoading,
    error: loadError,
    upsertSubscription,
    deleteSubscription,
  } = useSubscriptions();

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

  const editor = useSubscriptionEditor({
    subscriptions,
    t,
    upsertSubscription,
    deleteSubscription,
  });

  return (
    <div className="section-stack-wide space-y-5">
      <PageHeader title={t("title")} description={t("description")} />

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(["KRW", "USD", "JPY"] as const).map((currency) => (
          <Card key={currency} className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("monthlyTotal")} ({currency})
            </p>
            <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
              {formatMoney(summary[currency].monthly, currency)}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {t("yearlyTotal")}{" "}
              {formatMoney(summary[currency].yearly, currency)}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <SubscriptionForm
          form={editor.form}
          editingId={editor.editingId}
          errorMessage={editor.errorMessage}
          previewPaymentText={editor.previewPaymentText}
          previewCycleLabel={editor.previewCycleLabel}
          previewDateLabel={editor.previewDateLabel}
          previewDate={editor.previewDate}
          onSubmit={editor.handleSubmit}
          onReset={editor.resetForm}
          onPresetChange={editor.handlePresetChange}
          setForm={editor.setForm}
          isSubmitting={editor.isSubmitting}
        />
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t("registered")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("totalCount", { count: subscriptions.length })}
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {t("loadingData")}
            </div>
          ) : null}

          {!isLoading && sortedSubscriptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              {t("noSubscriptions")}
            </div>
          ) : null}

          {!isLoading && sortedSubscriptions.length > 0 ? (
            <div className="flex max-w-[950px] flex-wrap gap-3">
              {sortedSubscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  isLogoBroken={editor.logoError[subscription.id] ?? false}
                  isMemoOpen={editor.memoOpenMap[subscription.id] ?? false}
                  onLogoError={editor.handleLogoError}
                  onToggleMemo={editor.handleToggleMemo}
                  onEdit={editor.handleEdit}
                  onDelete={() => {
                    if (editor.deletingId) return;
                    void editor.handleDelete(subscription.id);
                  }}
                  isDeleting={editor.deletingId === subscription.id}
                />
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
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

export default function SubscriptionsPage() {
  const { subscriptions, upsertSubscription, deleteSubscription } =
    useSubscriptions();
  const [form, setForm] = useState<SubscriptionFormState>(createInitialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});
  const [memoOpenMap, setMemoOpenMap] = useState<Record<string, boolean>>({});

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
    previewDateInfo.reason === "end_date" ? "종료일" : "다음 결제일(예상)";
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
    (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage(null);

      const parsedDefaultPrice = Number(form.defaultPrice);
      const parsedActualPrice = Number(form.actualPrice);
      const parsedParticipantCount = Number(form.participantCount);
      const parsedCustomMonths = Number(form.customCycleMonths);

      if (!form.serviceName.trim()) {
        setErrorMessage("서비스 이름을 입력해 주세요.");
        return;
      }
      if (!Number.isFinite(parsedDefaultPrice) || parsedDefaultPrice < 0) {
        setErrorMessage("기본 가격은 0 이상의 숫자로 입력해 주세요.");
        return;
      }
      if (!Number.isFinite(parsedActualPrice) || parsedActualPrice < 0) {
        setErrorMessage("결제 가격은 0 이상의 숫자로 입력해 주세요.");
        return;
      }
      if (
        !Number.isFinite(parsedParticipantCount) ||
        parsedParticipantCount <= 0
      ) {
        setErrorMessage("사용자 수는 1 이상으로 입력해 주세요.");
        return;
      }
      if (!form.billingStartDate) {
        setErrorMessage("결제 시작날짜를 입력해 주세요.");
        return;
      }
      if (
        form.billingCycle === "custom" &&
        (!Number.isFinite(parsedCustomMonths) || parsedCustomMonths <= 0)
      ) {
        setErrorMessage("그외 주기 월 수는 1 이상으로 입력해 주세요.");
        return;
      }
      if (form.endDate && form.endDate < form.billingStartDate) {
        setErrorMessage("종료일은 결제 시작날짜와 같거나 이후여야 합니다.");
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
          form.billingCycle === "custom" ? Math.floor(parsedCustomMonths) : null,
        billingStartDate: form.billingStartDate,
        endDate: form.endDate || null,
        accountName: form.accountName.trim(),
        memo: form.memo.trim(),
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
        // legacy compatibility
        basePrice: parsedDefaultPrice,
        billingAnchorDate: form.billingStartDate,
        expectedEndDate: form.endDate || null,
        customCycleEndDate: null,
        customCycleDays: null,
        autoRenew: true,
        accounts: undefined,
      };

      upsertSubscription(nextSubscription);
      resetForm();
    },
    [editingId, form, resetForm, subscriptions, upsertSubscription],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          구독관리
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          결제 가격과 사용자 수를 기준으로 실제 부담 금액/다음 결제일을 추적합니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(["KRW", "USD", "JPY"] as const).map((currency) => (
          <Card key={currency} className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              월 환산 합계 ({currency})
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {formatMoney(summary[currency].monthly, currency)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              연 환산 {formatMoney(summary[currency].yearly, currency)}
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
        />
      </Card>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              등록된 구독
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              총 {subscriptions.length}건
            </p>
          </div>

          {sortedSubscriptions.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              아직 등록된 구독이 없습니다.
            </div>
          )}

          {sortedSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              isLogoBroken={logoError[subscription.id] ?? false}
              isMemoOpen={memoOpenMap[subscription.id] ?? false}
              onLogoError={handleLogoError}
              onToggleMemo={handleToggleMemo}
              onEdit={handleEdit}
              onDelete={deleteSubscription}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

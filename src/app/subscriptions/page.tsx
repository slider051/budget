"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import {
  formatMoney,
  getCycleLabel,
  getCycleMonths,
  getCyclePaymentLabel,
  getDiscountPercent,
  getDisplayedNextPaymentDate,
  getPerPersonCyclePrice,
  getPerPersonDefaultPrice,
  getSubscriptionMonthlyAmount,
  getSubscriptionYearlyAmount,
  summarizeByCurrency,
} from "@/lib/subscriptions/calculations";
import {
  CATEGORY_LABELS,
  CURRENCY_LABELS,
  SUBSCRIPTION_PRESETS,
} from "@/lib/subscriptions/presets";
import type {
  BillingCycle,
  Subscription,
  SubscriptionCategory,
  SubscriptionCurrency,
} from "@/types/subscription";

interface SubscriptionFormState {
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

const CUSTOM_SERVICE_KEY = "__custom__";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function createInitialFormState(): SubscriptionFormState {
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

function mapSubscriptionToForm(subscription: Subscription): SubscriptionFormState {
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

  const previewSubscription = useMemo<Subscription>(() => {
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
  }, [form]);

  const handlePresetChange = (nextServiceKey: string) => {
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
  };

  const resetForm = () => {
    setForm(createInitialFormState());
    setEditingId(null);
    setErrorMessage(null);
  };

  const toggleMemo = (id: string) => {
    setMemoOpenMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    if (!Number.isFinite(parsedParticipantCount) || parsedParticipantCount <= 0) {
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
  };

  const handleEdit = (subscription: Subscription) => {
    setForm(mapSubscriptionToForm(subscription));
    setEditingId(subscription.id);
    setErrorMessage(null);
  };

  const previewNextPayment = getDisplayedNextPaymentDate(previewSubscription).date;
  const previewPaymentPrice = getPerPersonCyclePrice(previewSubscription);
  const previewCycleLabel = getCyclePaymentLabel(
    previewSubscription.billingCycle,
    previewSubscription.customCycleMonths,
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
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {editingId ? "구독 수정" : "구독 추가"}
            </h2>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                수정 취소
              </Button>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
              기본 정보
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  서비스 프리셋
                </span>
                <select
                  value={form.serviceKey}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                >
                  {SUBSCRIPTION_PRESETS.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.name}
                    </option>
                  ))}
                  <option value={CUSTOM_SERVICE_KEY}>직접 입력</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  서비스명
                </span>
                <input
                  value={form.serviceName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, serviceName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
              결제/주기 정보
            </p>

            <div className="grid gap-4 md:grid-cols-4">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  카테고리
                </span>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value as SubscriptionCategory,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  통화
                </span>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      currency: e.target.value as SubscriptionCurrency,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                >
                  {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  기본 가격
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.defaultPrice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, defaultPrice: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  결제 가격
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.actualPrice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, actualPrice: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  사용자 수
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.participantCount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      participantCount: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  결제 시작날짜
                </span>
                <input
                  type="date"
                  value={form.billingStartDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      billingStartDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  결제주기
                </span>
                <select
                  value={form.billingCycle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      billingCycle: e.target.value as BillingCycle,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="monthly">한달</option>
                  <option value="yearly">연간</option>
                  <option value="custom">그외 (월 수 입력)</option>
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  종료일 (선택)
                </span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>
            </div>

            {form.billingCycle === "custom" && (
              <div className="mt-4 max-w-xs">
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                    그외 주기 (개월)
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={form.customCycleMonths}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        customCycleMonths: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
              추가 정보
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  계정이름
                </span>
                <input
                  value={form.accountName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, accountName: e.target.value }))
                  }
                  placeholder="예: 가족공용, 본인계정"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                  로고 URL
                </span>
                <input
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, logoUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">
                메모 (선택)
              </span>
              <textarea
                value={form.memo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, memo: e.target.value }))
                }
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
            </label>
          </div>

          <div className="rounded-lg border border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              미리보기
            </p>
            <p className="mt-1 text-lg font-extrabold text-indigo-700 dark:text-indigo-300">
              결제 가격: {formatMoney(previewPaymentPrice, previewSubscription.currency)} (
              {previewCycleLabel})
            </p>
            <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300/80">
              전체 요금 {formatMoney(previewSubscription.actualPrice, previewSubscription.currency)} /{" "}
              {previewSubscription.participantCount}명 분담
            </p>
            <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
              다음 결제일(예상): {previewNextPayment ?? "-"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit">
              {editingId ? "구독 업데이트" : "구독 추가"}
            </Button>
          </div>
        </form>
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

          {sortedSubscriptions.map((subscription) => {
            const monthlyAmount = getSubscriptionMonthlyAmount(subscription);
            const yearlyAmount = getSubscriptionYearlyAmount(subscription);
            const discountPercent = getDiscountPercent(subscription);
            const nextPayment = getDisplayedNextPaymentDate(subscription);
            const isLogoBroken = logoError[subscription.id];
            const isMemoOpen = memoOpenMap[subscription.id] ?? false;
            const cyclePrice = getPerPersonCyclePrice(subscription);
            const baselinePrice = getPerPersonDefaultPrice(subscription);
            const cycleLabel = getCyclePaymentLabel(
              subscription.billingCycle,
              subscription.customCycleMonths,
            );
            const cycleMonths = getCycleMonths(
              subscription.billingCycle,
              subscription.customCycleMonths,
            );

            return (
              <div
                key={subscription.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {subscription.logoUrl && !isLogoBroken ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={subscription.logoUrl}
                        alt={`${subscription.serviceName} logo`}
                        className="h-10 w-10 rounded-lg border border-gray-200 bg-white object-contain p-1 dark:border-gray-700"
                        onError={() =>
                          setLogoError((prev) => ({
                            ...prev,
                            [subscription.id]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-indigo-700">
                        {subscription.serviceName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {subscription.serviceName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {CATEGORY_LABELS[subscription.category]} |{" "}
                        {getCycleLabel(
                          subscription.billingCycle,
                          subscription.customCycleMonths,
                        )}{" "}
                        | 시작일 {subscription.billingStartDate}
                      </p>
                      {subscription.accountName && (
                        <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                          계정이름: {subscription.accountName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {discountPercent > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {discountPercent}% 할인
                      </span>
                    )}
                    {subscription.memo && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => toggleMemo(subscription.id)}
                      >
                        {isMemoOpen ? "메모 숨기기" : "메모 보기"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(subscription)}
                    >
                      수정
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSubscription(subscription.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-950/30">
                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    핵심 결제 정보
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-indigo-700 dark:text-indigo-300">
                    결제 가격: {formatMoney(cyclePrice, subscription.currency)} ({cycleLabel})
                  </p>
                  <p className="mt-1 text-xs text-indigo-700/80 dark:text-indigo-300/80">
                    전체 요금 {formatMoney(subscription.actualPrice, subscription.currency)} /{" "}
                    {subscription.participantCount}명 분담
                  </p>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-2 lg:grid-cols-4">
                  <p>
                    기본 가격(1인): <strong>{formatMoney(baselinePrice, subscription.currency)}</strong>
                  </p>
                  <p>
                    월 환산: <strong>{formatMoney(monthlyAmount, subscription.currency)}</strong>
                  </p>
                  <p>
                    연 환산: <strong>{formatMoney(yearlyAmount, subscription.currency)}</strong>
                  </p>
                  <p>
                    환산 기준: <strong>{cycleMonths}개월</strong>
                  </p>
                </div>

                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  다음 결제일(예상): <strong>{nextPayment.date ?? "-"}</strong>
                  {nextPayment.reason === "end_date" && " (종료일 적용)"}
                </p>

                {isMemoOpen && subscription.memo && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                    {subscription.memo}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

"use client";

import Button from "@/components/ui/Button";
import {
  CATEGORY_LABELS,
  CURRENCY_LABELS,
  SUBSCRIPTION_PRESETS,
} from "@/lib/subscriptions/presets";
import type {
  BillingCycle,
  SubscriptionCategory,
  SubscriptionCurrency,
} from "@/types/subscription";
import type { SubscriptionFormState } from "./subscriptionFormState";

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
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {editingId ? "구독 수정" : "구독 추가"}
        </h2>
        {editingId && (
          <Button type="button" variant="outline" onClick={onReset}>
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
              onChange={(e) => onPresetChange(e.target.value)}
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
          1인 결제가격: {previewPaymentText} ({previewCycleLabel})
        </p>
        <div className="mt-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
          {previewDateLabel}: {previewDate ?? "-"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "저장 중..."
            : editingId
              ? "구독 업데이트"
              : "구독 추가"}
        </Button>
      </div>
    </form>
  );
}
"use client";

import { useTranslations } from "next-intl";
import PageHeader from "@/components/ui/PageHeader";
import InfoBanner from "@/components/ui/InfoBanner";
import FixedExpenseForm from "@/components/budget/FixedExpenseForm";
import {
  DASHBOARD_PRESETS,
  DASHBOARD_PRESET_ORDER,
} from "@/lib/presets/dashboardPresets";

export default function NewFixedExpensePage() {
  const t = useTranslations("fixedExpenses");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="section-stack-wide grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="max-w-2xl">
          <InfoBanner
            title={t("whatIs")}
            description={t("whatIsDesc")}
            className="mb-6"
          />

          <FixedExpenseForm />

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              {t("tips")}
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t("tip1")}</li>
              <li>• {t("tip2")}</li>
              <li>• {t("tip3")}</li>
            </ul>
          </div>
        </div>

        <aside>
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <h4 className="text-sm font-semibold text-violet-900 mb-2">
              {t("presetGuide")}
            </h4>
            <p className="text-xs text-violet-800 mb-3">
              {t("presetGuideDesc")}
            </p>
            <code className="block rounded-lg bg-white px-2 py-1 text-xs text-violet-900 mb-4">
              src/lib/presets/dashboardPresets.ts
            </code>

            <div className="space-y-3">
              {DASHBOARD_PRESET_ORDER.map((presetId) => {
                const preset = DASHBOARD_PRESETS[presetId];
                return (
                  <div
                    key={preset.id}
                    className="rounded-lg bg-white p-3 border border-violet-100"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {preset.label}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {t("presetIncome")}:{" "}
                      {preset.income.amount.toLocaleString()}
                      {" ("}
                      {preset.income.description}
                      {")"}
                    </p>
                    <p className="text-xs font-medium text-gray-700 mt-2">
                      {t("presetBudgetSample")}
                    </p>
                    <div className="mt-1 space-y-1">
                      {Object.entries(preset.budgets).map(
                        ([category, amount]) => (
                          <p key={category} className="text-xs text-gray-600">
                            {category}: {amount.toLocaleString()}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

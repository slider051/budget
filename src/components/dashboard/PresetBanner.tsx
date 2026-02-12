"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useBudget } from "@/hooks/useBudget";
import { applyDashboardPreset } from "@/lib/presets/applyDashboardPreset";
import {
  DASHBOARD_PRESETS,
  DASHBOARD_PRESET_ORDER,
  DASHBOARD_PRESET_STORAGE_KEY,
  type DashboardPresetId,
} from "@/lib/presets/dashboardPresets";

function getStoredPreset(): DashboardPresetId | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DASHBOARD_PRESET_STORAGE_KEY);
  if (raw === "student" || raw === "worker") return raw;
  return null;
}

export default function PresetBanner() {
  const { state, replaceTransactions } = useBudget();
  const [lastAppliedPreset, setLastAppliedPreset] = useState<DashboardPresetId | null>(
    () => getStoredPreset(),
  );
  const [message, setMessage] = useState<string>("");

  const presetItems = useMemo(
    () => DASHBOARD_PRESET_ORDER.map((id) => DASHBOARD_PRESETS[id]),
    [],
  );

  const handleApplyPreset = (presetId: DashboardPresetId) => {
    const result = applyDashboardPreset(presetId, state.transactions);
    replaceTransactions(result.transactions);
    setLastAppliedPreset(presetId);
    setMessage(`${result.presetLabel} 프리셋을 적용했습니다.`);
  };

  return (
    <div className="mb-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
            프리셋 빠른 설정
          </p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            직업만 알려주시면 바로 프리셋 등록해드려요
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            학생 / 직장인 기본 샘플을 즉시 적용합니다. (거래 1건 + 월 예산 + 기본
            구독)
          </p>
          {lastAppliedPreset && (
            <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
              최근 적용: {DASHBOARD_PRESETS[lastAppliedPreset].label}
            </p>
          )}
          {message && (
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
              {message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {presetItems.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant={lastAppliedPreset === preset.id ? "primary" : "outline"}
              onClick={() => handleApplyPreset(preset.id)}
              className="whitespace-nowrap"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

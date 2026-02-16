"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useBudget } from "@/hooks/useBudget";
import { applyDashboardPreset } from "@/lib/presets/applyDashboardPreset";
import {
  DASHBOARD_PRESETS,
  DASHBOARD_PRESET_ORDER,
  DASHBOARD_PRESET_STORAGE_KEY,
  type DashboardPresetId,
} from "@/lib/presets/dashboardPresets";

interface PresetBannerProps {
  variant?: "default" | "compact" | "strip";
  className?: string;
}

type FeedbackState = {
  text: string;
  tone: "success" | "error" | null;
};

function getStoredPreset(): DashboardPresetId | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DASHBOARD_PRESET_STORAGE_KEY);
  if (raw === "student" || raw === "worker") return raw;
  return null;
}

export default function PresetBanner({
  variant = "default",
  className = "",
}: PresetBannerProps) {
  const t = useTranslations("dashboard");
  const { state, replaceTransactions } = useBudget();
  const [lastAppliedPreset, setLastAppliedPreset] =
    useState<DashboardPresetId | null>(() => getStoredPreset());
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    text: "",
    tone: null,
  });

  const presetItems = useMemo(
    () => DASHBOARD_PRESET_ORDER.map((id) => DASHBOARD_PRESETS[id]),
    [],
  );

  const handleApplyPreset = async (presetId: DashboardPresetId) => {
    try {
      setIsApplying(true);
      const result = await applyDashboardPreset(presetId, state.transactions);
      await replaceTransactions(result.transactions);
      setLastAppliedPreset(presetId);
      setFeedback({
        text: t("presetApplySuccess", { label: result.presetLabel }),
        tone: "success",
      });
    } catch (error) {
      console.error(error);
      setFeedback({
        text: t("presetApplyError"),
        tone: "error",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const isCompact = variant !== "default";
  const isStrip = variant === "strip";

  const sectionClassByVariant: Record<
    NonNullable<PresetBannerProps["variant"]>,
    string
  > = {
    default:
      "mb-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30",
    compact:
      "rounded-2xl border border-white/70 bg-white/85 p-4 backdrop-blur-sm shadow-sm",
    strip:
      "rounded-2xl border border-indigo-200/80 bg-white/95 p-3 shadow-sm sm:p-4",
  };

  const sectionClass = sectionClassByVariant[variant];
  const containerClass = isStrip
    ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    : isCompact
      ? "space-y-3"
      : "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between";

  const labelClass = isCompact
    ? "text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700"
    : "text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300";

  const titleClass = isStrip
    ? "mt-1 text-base font-semibold leading-tight text-slate-900"
    : isCompact
      ? "mt-1 text-base font-semibold leading-tight text-slate-900"
      : "mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100";

  const descriptionClass = isStrip
    ? "mt-1 text-xs text-slate-600 sm:hidden"
    : isCompact
      ? "mt-1 text-xs leading-5 text-slate-600"
      : "mt-1 text-sm text-gray-600 dark:text-gray-300";

  const appliedClass = isCompact
    ? "mt-1 text-xs text-indigo-700"
    : "mt-2 text-xs text-indigo-700 dark:text-indigo-300";

  const successClass = isCompact
    ? "mt-1 text-xs text-emerald-700"
    : "mt-1 text-xs text-emerald-700 dark:text-emerald-300";

  const errorClass = isCompact
    ? "mt-1 text-xs text-rose-700"
    : "mt-1 text-xs text-rose-700 dark:text-rose-300";

  return (
    <section className={`${sectionClass} ${className}`.trim()}>
      <div className={containerClass}>
        <div>
          <p className={labelClass}>{t("presetQuickSetup")}</p>
          <h2 className={titleClass}>{t("presetTitle")}</h2>
          <p className={descriptionClass}>{t("presetDescription")}</p>
          {lastAppliedPreset && (
            <p className={appliedClass}>
              {t("presetApplied")} {DASHBOARD_PRESETS[lastAppliedPreset].label}
            </p>
          )}
          {feedback.text && (
            <p
              className={feedback.tone === "error" ? errorClass : successClass}
            >
              {feedback.text}
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
              disabled={isApplying}
              className={
                isStrip
                  ? "h-9 px-3 text-sm"
                  : isCompact
                    ? "h-9 px-3 text-sm"
                    : "whitespace-nowrap"
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

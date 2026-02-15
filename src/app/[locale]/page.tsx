"use client";

import { useTranslations } from "next-intl";
import QuickActionTiles from "@/components/budget/QuickActionTiles";
import PresetBanner from "@/components/dashboard/PresetBanner";

export default function Home() {
  const t = useTranslations("dashboard");

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("heroTitle")}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          {t("heroDescription")}
        </p>
      </div>

      <PresetBanner />

      {/* Quick Action Tiles */}
      <QuickActionTiles />

      {/* Value Proposition */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("realtimeAnalysis")}
          </h3>
          <p className="text-sm text-gray-600">{t("realtimeAnalysisDesc")}</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("goalSetting")}
          </h3>
          <p className="text-sm text-gray-600">{t("goalSettingDesc")}</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("quickInput")}
          </h3>
          <p className="text-sm text-gray-600">{t("quickInputDesc")}</p>
        </div>
      </div>
    </div>
  );
}

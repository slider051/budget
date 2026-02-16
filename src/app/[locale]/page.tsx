"use client";

import { useTranslations } from "next-intl";
import PresetBanner from "@/components/dashboard/PresetBanner";
import QuickActionTiles from "@/components/budget/QuickActionTiles";

export default function Home() {
  const t = useTranslations("dashboard");

  return (
    <div className="section-stack-wide space-y-4 pb-4">
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {t("heroTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t("heroDescription")}</p>
      </section>

      <PresetBanner variant="strip" />

      <section className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm sm:p-4">
        <QuickActionTiles
          className="gap-3"
          cardClassName="border-slate-200 bg-white shadow-none hover:border-indigo-300 hover:shadow-sm"
        />
      </section>
    </div>
  );
}

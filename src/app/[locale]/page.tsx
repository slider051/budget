"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import QuickActionTiles from "@/components/budget/QuickActionTiles";
import PresetBanner from "@/components/dashboard/PresetBanner";
import { useUI } from "@/hooks/useUI";
import {
  getDashboardHeroTitle,
  getDashboardMonthBadge,
} from "@/lib/dashboard/homeUi";

export default function Home() {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const { selectedMonth } = useUI();

  const badgeText = getDashboardMonthBadge(locale, selectedMonth);
  const heroTitle = getDashboardHeroTitle(locale);

  return (
    <div className="section-stack-wide space-y-4 lg:space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-sky-200/80 bg-sky-100 shadow-sm lg:-ml-10 lg:w-[calc(100%+2.5rem)] xl:-ml-14 xl:w-[calc(100%+3.5rem)]">
        <Image
          src="/images/spot-dashboard.jpg"
          alt="Dashboard beach castle background"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1300px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/18 via-white/8 to-white/86" />

        <div className="relative z-10 p-5 sm:p-6 lg:p-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex w-fit rounded-md border border-slate-300/80 bg-white/90 px-4 py-2 text-sm font-semibold tracking-tight text-slate-900 shadow-sm sm:text-base">
              {badgeText}
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/75 p-5 backdrop-blur-sm sm:p-6">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                {heroTitle}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                {t("heroDescription")}
              </p>
            </div>
          </div>
        </div>
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

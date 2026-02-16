"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useUI } from "@/hooks/useUI";
import QuickActionTiles from "@/components/budget/QuickActionTiles";
import PresetBanner from "@/components/dashboard/PresetBanner";

const MONTHLY_THEME_LABELS = {
  ko: [
    "새해 아침",
    "파도 성채",
    "봄바람 정원",
    "벚꽃 언덕",
    "햇살 마당",
    "초여름 브리즈",
    "블루 라군",
    "휴가 비치",
    "황금 모래",
    "노을 항구",
    "윈터 비치",
    "연말 포트",
  ],
  en: [
    "New Year Glow",
    "Wave Fortress",
    "Spring Breeze",
    "Cherry Ridge",
    "Sunlit Court",
    "Early Summer",
    "Blue Lagoon",
    "Holiday Beach",
    "Golden Sand",
    "Sunset Harbor",
    "Winter Beach",
    "Year-End Port",
  ],
} as const;

function getMonthThemeBadge(locale: string, selectedMonth: string) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const index = Math.max(0, Math.min(11, (month || 1) - 1));
  const language = locale === "ko" ? "ko" : "en";
  const monthDate = new Date(year || new Date().getFullYear(), index, 1);
  const monthLabel = new Intl.DateTimeFormat(
    language === "ko" ? "ko-KR" : "en-US",
    {
      month: "long",
    },
  ).format(monthDate);
  const theme = MONTHLY_THEME_LABELS[language][index];

  return language === "ko"
    ? `Qoint | ${monthLabel} ${theme}`
    : `Qoint | ${theme} ${monthLabel}`;
}

export default function Home() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { selectedMonth } = useUI();
  const badgeText = getMonthThemeBadge(locale, selectedMonth);
  const heroTitle =
    locale === "ko" ? "예산을 쉽게 관리해보세요" : t("heroTitle");

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-sky-100 shadow-sm">
        <Image
          src="/images/spot-dashboard.jpg"
          alt="Dashboard beach castle background"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-white/82" />

        <div className="relative z-10 p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex w-fit rounded-md border border-slate-300/90 bg-white/90 px-4 py-2 text-sm font-semibold tracking-tight text-slate-900 shadow-sm sm:text-lg">
                {badgeText}
              </div>

              <div className="mt-4 rounded-2xl border border-white/75 bg-white/76 p-5 backdrop-blur-sm sm:p-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {heroTitle}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                  {t("heroDescription")}
                </p>
              </div>
            </div>

            <PresetBanner compact className="w-full max-w-md lg:mt-1" />
          </div>

          <div className="mt-5">
            <QuickActionTiles
              className="gap-3"
              cardClassName="border-white/70 bg-white/90 backdrop-blur-sm hover:border-indigo-300"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

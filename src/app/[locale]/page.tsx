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
  const monthLabel = new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
    month: "long",
  }).format(monthDate);
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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-sky-100 shadow-sm">
        <Image
          src="/images/spot-dashboard.jpg"
          alt="Dashboard beach castle background"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/90" />

        <div className="relative z-10 flex min-h-[460px] flex-col p-4 sm:p-6 lg:p-8">
          <div className="inline-flex w-fit rounded-md border border-gray-400 bg-white/90 px-4 py-2 text-sm font-bold tracking-tight text-gray-900 shadow-sm sm:px-6 sm:text-xl">
            {badgeText}
          </div>

          <div className="mt-6 max-w-2xl rounded-2xl border border-white/70 bg-white/75 p-5 backdrop-blur-sm sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-700 sm:text-base">
              {t("heroDescription")}
            </p>
          </div>

          <div className="mt-auto pt-6">
            <QuickActionTiles
              className="gap-3"
              cardClassName="border-white/70 bg-white/88 backdrop-blur-sm hover:border-indigo-300"
            />
          </div>
        </div>
      </section>

      <PresetBanner />
    </div>
  );
}

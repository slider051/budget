"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getDashboardHeroTitle } from "@/lib/dashboard/homeUi";
import { isLocaleRootPath } from "@/lib/routing/shellRoute";
import AdRail from "@/components/ui/AdRail";
import Sidebar from "@/components/ui/Sidebar";

interface AppLayoutShellProps {
  readonly children: React.ReactNode;
}

export default function AppLayoutShell({ children }: AppLayoutShellProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("dashboard");

  if (isLocaleRootPath(pathname)) {
    const heroTitle = getDashboardHeroTitle(locale);

    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <section className="relative h-[46vh] min-h-[320px] max-h-[560px] w-full overflow-hidden">
          <Image
            src="/images/spot-dashboard.jpg"
            alt="Dashboard beach castle background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-white/45 dark:to-gray-950/70" />

          <div className="relative mx-auto flex h-full w-full max-w-[1400px] items-start px-6 pt-7 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="rounded-2xl border border-white/75 bg-white/72 p-5 shadow-sm backdrop-blur-sm sm:p-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  {heroTitle}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                  {t("heroDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 pb-8 -mt-16 lg:flex-row">
          <div className="w-64 shrink-0">
            <Sidebar variant="floating" />
          </div>
          <main className="min-w-0 flex-1 overflow-x-hidden lg:-mt-10">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-auto px-6 py-6">
        <div className="page-rail-fixed">{children}</div>
      </main>
      <AdRail />
    </div>
  );
}

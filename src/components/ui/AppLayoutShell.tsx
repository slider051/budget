"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { isLocaleRootPath } from "@/lib/routing/shellRoute";
import AdRail from "@/components/ui/AdRail";
import Sidebar from "@/components/ui/Sidebar";

interface AppLayoutShellProps {
  readonly children: React.ReactNode;
}

export default function AppLayoutShell({ children }: AppLayoutShellProps) {
  const pathname = usePathname();

  if (isLocaleRootPath(pathname)) {
    return (
      <div className="relative min-h-screen text-gray-900 dark:text-gray-100">
        <Image
          src="/images/spot-dashboard.jpg"
          alt="Dashboard background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top -z-10"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-white/50 to-slate-50 dark:from-black/30 dark:via-gray-950/60 dark:to-gray-950" />

        <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 pb-8 lg:flex-row">
          <div className="w-64 shrink-0 pt-[200px]">
            <Sidebar variant="floating" />
          </div>
          <main className="min-w-0 flex-1 overflow-x-hidden pt-[400px]">
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

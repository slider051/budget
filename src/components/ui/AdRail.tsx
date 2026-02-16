"use client";

import { usePathname } from "next/navigation";

const SHOW_AD_ON_DASHBOARD = false;

function isDashboardPath(pathname: string | null): boolean {
  if (!pathname) return false;
  const normalized = pathname.replace(/\/+$/, "");
  return normalized === "/ko" || normalized === "/en";
}

export default function AdRail() {
  const pathname = usePathname();
  const dashboard = isDashboardPath(pathname);

  if (dashboard && !SHOW_AD_ON_DASHBOARD) {
    return null;
  }

  return (
    <aside className="hidden w-[300px] shrink-0 border-l border-gray-200 px-4 py-6 dark:border-gray-700 xl:block">
      <div className="sticky top-6">
        <div className="flex h-[600px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <span className="text-sm text-gray-400 dark:text-gray-500">Ad Space</span>
        </div>
      </div>
    </aside>
  );
}

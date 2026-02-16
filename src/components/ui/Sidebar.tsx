"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { routing } from "@/i18n/routing";

interface MenuItem {
  href: string;
  labelKey: string;
  icon: string;
}

interface SidebarProps {
  variant?: "default" | "floating";
}

const menuItems: readonly MenuItem[] = [
  { href: "/", labelKey: "dashboard", icon: "📊" },
  { href: "/budget", labelKey: "budget", icon: "💰" },
  { href: "/transactions", labelKey: "transactions", icon: "📝" },
  { href: "/fixed-expenses/new", labelKey: "fixedExpenses", icon: "🔁" },
  { href: "/subscriptions", labelKey: "subscriptions", icon: "🎟️" },
  { href: "/analysis", labelKey: "analysis", icon: "📈" },
  { href: "/settings", labelKey: "settings", icon: "⚙️" },
];

function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || "/";
    }
  }
  return pathname;
}

export default function Sidebar({ variant = "default" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const strippedPath = stripLocalePrefix(pathname);

  if (strippedPath.startsWith("/login") || strippedPath.startsWith("/auth")) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setIsSigningOut(false);
  };

  const handleSwitchLocale = () => {
    const nextLocale = locale === "ko" ? "en" : "ko";
    const newPath = `/${nextLocale}${strippedPath}`;
    router.push(newPath);
  };

  const isFloating = variant === "floating";

  return (
    <aside
      className={
        isFloating
          ? "sticky top-6 z-20 flex w-56 shrink-0 flex-col px-1 py-1"
          : "flex w-64 min-h-screen flex-col border-r border-gray-200 bg-white px-6 py-8 dark:border-gray-700 dark:bg-gray-800"
      }
    >
      {/* Logo */}
      <div className={isFloating ? "mb-7" : "mb-12"}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            Q
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            oint
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={isFloating ? "space-y-1.5" : "space-y-2"}>
        {menuItems.map((item) => {
          const isActive = strippedPath === item.href;
          const floatingClass = isActive
            ? "bg-white/88 text-indigo-600 shadow-sm dark:bg-gray-900/88 dark:text-indigo-300"
            : "text-slate-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-900/75";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isFloating
                  ? floatingClass
                  : isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className={
          isFloating
            ? "mt-5 space-y-2 border-t border-gray-200/80 pt-4 dark:border-gray-700/80"
            : "mt-auto pt-6 space-y-2"
        }
      >
        <button
          type="button"
          onClick={handleSwitchLocale}
          className={`w-full rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            isFloating
              ? "border-white/80 bg-white/85 text-slate-700 hover:bg-white dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {tc("switchLang")}
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={`w-full rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isFloating
              ? "border-white/80 bg-white/85 text-slate-700 hover:bg-white dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:bg-gray-900"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {isSigningOut ? tc("loggingOut") : tc("logout")}
        </button>
      </div>
    </aside>
  );
}

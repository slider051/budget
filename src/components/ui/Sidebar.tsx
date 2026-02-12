"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/", label: "대시보드", icon: "📊" },
  { href: "/budget", label: "예산 현황", icon: "💰" },
  { href: "/transactions", label: "거래내역", icon: "📝" },
  { href: "/fixed-expenses/new", label: "고정지출", icon: "🔁" },
  { href: "/subscriptions", label: "구독관리", icon: "🎟️" },
  { href: "/analysis", label: "연간 분석", icon: "📈" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 py-8">
      {/* Logo */}
      <div className="mb-12">
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
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

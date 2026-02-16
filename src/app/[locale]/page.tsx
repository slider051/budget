"use client";

import PresetBanner from "@/components/dashboard/PresetBanner";
import QuickActionTiles from "@/components/budget/QuickActionTiles";

export default function Home() {
  return (
    <div className="w-full space-y-4 pb-4">
      <QuickActionTiles
        className="gap-3"
        cardClassName="border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md"
      />

      <div className="max-w-[50%]">
        <PresetBanner variant="compact" />
      </div>
    </div>
  );
}

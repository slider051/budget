import type { TransactionType } from "@/types/budget";

export type DashboardPresetId = "student" | "worker";

interface PresetIncome {
  readonly type: TransactionType;
  readonly amount: number;
  readonly category: string;
  readonly description: string;
}

export interface DashboardPreset {
  readonly id: DashboardPresetId;
  readonly label: string;
  readonly description: string;
  readonly income: PresetIncome;
  readonly budgets: Readonly<Record<string, number>>;
  readonly subscriptionKeys: readonly string[];
}

export const DASHBOARD_PRESETS: Record<DashboardPresetId, DashboardPreset> = {
  student: {
    id: "student",
    label: "학생",
    description:
      "용돈 30만원 기준의 기본 예산과 구독 샘플을 빠르게 등록합니다.",
    income: {
      type: "income",
      amount: 300000,
      category: "기타수입",
      description: "월 용돈",
    },
    budgets: {
      식비: 70000,
      교육: 100000,
      교통비: 50000,
      문화생활: 40000,
      쇼핑: 40000,
    },
    subscriptionKeys: ["youtube-premium", "melon"],
  },
  worker: {
    id: "worker",
    label: "사회초년생",
    description:
      "월급 230만원 기준의 기본 예산과 구독 샘플을 빠르게 등록합니다.",
    income: {
      type: "income",
      amount: 2300000,
      category: "급여",
      description: "월급",
    },
    budgets: {
      식비: 400000,
      교통비: 150000,
      주거비: 700000,
      통신비: 100000,
      쇼핑: 200000,
      문화생활: 150000,
      기타지출: 100000,
    },
    subscriptionKeys: ["youtube-premium", "chatgpt", "naver-membership"],
  },
};

export const DASHBOARD_PRESET_ORDER: readonly DashboardPresetId[] = [
  "student",
  "worker",
];

export const DASHBOARD_PRESET_STORAGE_KEY = "budget_dashboard_preset";
export const PRESET_TRANSACTION_PREFIX = "[프리셋]";
export const PRESET_SUBSCRIPTION_ID_PREFIX = "preset-profile-";

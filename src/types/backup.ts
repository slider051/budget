import type { Transaction } from "./budget";
import type { MonthlyBudget } from "./monthlyBudget";
import type { Subscription } from "./subscription";

export interface BackupData {
  readonly version: string;
  readonly exportedAt: string;
  readonly transactions: readonly Transaction[];
  readonly budgets: readonly MonthlyBudget[];
  readonly subscriptions: readonly Subscription[];
}

export type ImportMode = "replace" | "merge";

export interface ImportResult {
  readonly success: boolean;
  readonly message: string;
  readonly imported?: {
    readonly transactions: number;
    readonly budgets: number;
    readonly subscriptions: number;
  };
}

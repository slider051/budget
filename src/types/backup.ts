import type { Transaction } from "./budget";
import type { MonthlyBudget } from "./monthlyBudget";

export interface BackupData {
  readonly version: string;
  readonly exportedAt: string;
  readonly transactions: readonly Transaction[];
  readonly budgets: readonly MonthlyBudget[];
}

export type ImportMode = "replace" | "merge";

export interface ImportResult {
  readonly success: boolean;
  readonly message: string;
  readonly imported?: {
    readonly transactions: number;
    readonly budgets: number;
  };
}

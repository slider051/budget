import { BUDGET_STORAGE_KEY, STORAGE_KEY } from "@/lib/constants";
import { notifyStorageChange } from "@/lib/storage/localStorageStore";
import type { Transaction } from "@/types/budget";
import type { MonthlyBudget } from "@/types/monthlyBudget";
import type { BackupData, ImportMode, ImportResult } from "@/types/backup";
import { backupDataSchema } from "./backupSchema";

const BACKUP_VERSION = "1.0.0";

export function exportBackup(): BackupData {
  if (typeof window === "undefined") {
    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      transactions: [],
      budgets: [],
    };
  }

  try {
    const transactionsRaw = localStorage.getItem(STORAGE_KEY);
    const budgetsRaw = localStorage.getItem(BUDGET_STORAGE_KEY);

    const transactions: Transaction[] = transactionsRaw
      ? JSON.parse(transactionsRaw)
      : [];
    const budgets: MonthlyBudget[] = budgetsRaw ? JSON.parse(budgetsRaw) : [];

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
    };
  } catch (error) {
    console.error("Failed to export backup:", error);
    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      transactions: [],
      budgets: [],
    };
  }
}

export function downloadBackup(): void {
  const backup = exportBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `qoint-budget-backup-${timestamp}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importBackup(
  jsonString: string,
  mode: ImportMode,
): ImportResult {
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "Import is only available in the browser",
    };
  }

  try {
    const parsed = JSON.parse(jsonString);
    const validation = backupDataSchema.safeParse(parsed);

    if (!validation.success) {
      return {
        success: false,
        message: `검증 실패: ${validation.error.issues.map((e) => e.message).join(", ")}`,
      };
    }

    const data = validation.data;

    if (mode === "replace") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.transactions));
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(data.budgets));
    } else {
      const existingTransactionsRaw = localStorage.getItem(STORAGE_KEY);
      const existingBudgetsRaw = localStorage.getItem(BUDGET_STORAGE_KEY);

      const existingTransactions: Transaction[] = existingTransactionsRaw
        ? JSON.parse(existingTransactionsRaw)
        : [];
      const existingBudgets: MonthlyBudget[] = existingBudgetsRaw
        ? JSON.parse(existingBudgetsRaw)
        : [];

      const transactionMap = new Map(
        existingTransactions.map((t) => [t.id, t]),
      );
      data.transactions.forEach((t) => transactionMap.set(t.id, t));

      const budgetMap = new Map(existingBudgets.map((b) => [b.month, b]));
      data.budgets.forEach((b) => budgetMap.set(b.month, b));

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(transactionMap.values())),
      );
      localStorage.setItem(
        BUDGET_STORAGE_KEY,
        JSON.stringify(Array.from(budgetMap.values())),
      );
    }

    notifyStorageChange(STORAGE_KEY);
    notifyStorageChange(BUDGET_STORAGE_KEY);

    return {
      success: true,
      message: `성공적으로 ${mode === "replace" ? "복원" : "병합"}되었습니다`,
      imported: {
        transactions: data.transactions.length,
        budgets: data.budgets.length,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
    return {
      success: false,
      message: `Import 실패: ${errorMessage}`,
    };
  }
}

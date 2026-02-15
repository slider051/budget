import {
  deleteBudgetsByMonths,
  listAllBudgets,
  upsertBudget,
} from "@/lib/budget/budgetRepository";
import {
  normalizeSubscriptionRecord,
  listSubscriptions,
  upsertSubscriptions,
  deleteSubscriptionsByIds,
} from "@/lib/subscriptions/subscriptionRepository";
import {
  listTransactions,
  upsertTransactions,
  deleteTransactionsByIds,
} from "@/lib/transactions/transactionRepository";
import type { Transaction } from "@/types/budget";
import type { MonthlyBudget } from "@/types/monthlyBudget";
import type { Subscription } from "@/types/subscription";
import type { BackupData, ImportMode, ImportResult } from "@/types/backup";
import { backupDataSchema } from "./backupSchema";

const BACKUP_VERSION = "1.0.0";

function emptyBackupData(): BackupData {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    transactions: [],
    budgets: [],
    subscriptions: [],
  };
}

export async function exportBackup(): Promise<BackupData> {
  if (typeof window === "undefined") {
    return emptyBackupData();
  }

  try {
    const [transactions, budgets, subscriptions] = await Promise.all([
      listTransactions(),
      listAllBudgets(),
      listSubscriptions(),
    ]);

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      subscriptions,
    };
  } catch (error) {
    console.error("Failed to export backup:", error);
    return emptyBackupData();
  }
}

export async function downloadBackup(): Promise<void> {
  const backup = await exportBackup();
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

async function replaceWithImportedData(
  transactions: readonly Transaction[],
  budgets: readonly MonthlyBudget[],
  normalizedImportedSubscriptions: readonly Subscription[],
): Promise<void> {
  const [existingTransactions, existingBudgets, existingSubscriptions] =
    await Promise.all([
      listTransactions(),
      listAllBudgets(),
      listSubscriptions(),
    ]);

  await Promise.all([
    deleteTransactionsByIds(existingTransactions.map((item) => item.id)),
    deleteBudgetsByMonths(existingBudgets.map((item) => item.month)),
    deleteSubscriptionsByIds(existingSubscriptions.map((item) => item.id)),
  ]);

  await Promise.all([
    upsertTransactions(transactions),
    upsertImportedBudgets(budgets),
    upsertSubscriptions(normalizedImportedSubscriptions),
  ]);
}

async function upsertImportedBudgets(
  budgets: readonly MonthlyBudget[],
): Promise<void> {
  await Promise.all(
    budgets.map((item) => upsertBudget(item.month, { ...item.categories })),
  );
}

async function mergeWithImportedData(
  transactions: readonly Transaction[],
  normalizedImportedSubscriptions: readonly Subscription[],
  budgets: readonly MonthlyBudget[],
): Promise<void> {
  await Promise.all([
    upsertTransactions(transactions),
    upsertImportedBudgets(budgets),
    upsertSubscriptions(normalizedImportedSubscriptions),
  ]);
}

export async function importBackup(
  jsonString: string,
  mode: ImportMode,
): Promise<ImportResult> {
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
        message: `Validation failed: ${validation.error.issues.map((e) => e.message).join(", ")}`,
      };
    }

    const data = validation.data;
    const normalizedImportedSubscriptions = data.subscriptions
      .map((item) => normalizeSubscriptionRecord(item))
      .filter((item): item is Subscription => item !== null);

    if (mode === "replace") {
      await replaceWithImportedData(
        data.transactions,
        data.budgets,
        normalizedImportedSubscriptions,
      );
    } else {
      await mergeWithImportedData(
        data.transactions,
        normalizedImportedSubscriptions,
        data.budgets,
      );
    }

    return {
      success: true,
      message: `Successfully ${mode === "replace" ? "replaced" : "merged"} backup data.`,
      imported: {
        transactions: data.transactions.length,
        budgets: data.budgets.length,
        subscriptions: normalizedImportedSubscriptions.length,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Import failed: ${errorMessage}`,
    };
  }
}

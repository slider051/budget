"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { downloadBackup, importBackup } from "@/lib/backup/backupRepository";
import { clearAllAlerts } from "@/lib/alerts/budgetAlerts";
import { useTheme } from "@/hooks/useTheme";
import type { ImportMode } from "@/types/backup";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("settings");
  const [importMode, setImportMode] = useState<ImportMode>("replace");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      await downloadBackup();
      setMessage({ type: "success", text: t("backupSuccess") });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: t("exportFailed", {
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const result = await importBackup(text, importMode);

      if (result.success) {
        setMessage({
          type: "success",
          text: t("importSuccess", {
            message: result.message,
            transactions: result.imported?.transactions ?? 0,
            budgets: result.imported?.budgets ?? 0,
            subscriptions: result.imported?.subscriptions ?? 0,
          }),
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: t("fileReadError", {
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handleResetAlerts = () => {
    clearAllAlerts();
    setMessage({ type: "success", text: t("alertsResetSuccess") });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6 max-w-3xl">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("theme")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("themeDesc")}
            </p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={theme === "system"}
                  onChange={(e) =>
                    setTheme(e.target.value as "system" | "light" | "dark")
                  }
                  className="mr-2"
                />
                <span className="text-sm dark:text-gray-300">
                  <strong>System</strong> - {t("themeSystem")}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === "light"}
                  onChange={(e) =>
                    setTheme(e.target.value as "system" | "light" | "dark")
                  }
                  className="mr-2"
                />
                <span className="text-sm dark:text-gray-300">
                  <strong>Light</strong> - {t("themeLight")}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === "dark"}
                  onChange={(e) =>
                    setTheme(e.target.value as "system" | "light" | "dark")
                  }
                  className="mr-2"
                />
                <span className="text-sm dark:text-gray-300">
                  <strong>Dark</strong> - {t("themeDark")}
                </span>
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("backup")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("backupDesc")}
            </p>
            <Button onClick={handleExport}>{t("exportBackup")}</Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("restore")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("restoreDesc")}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("importMode")}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === "replace"}
                      onChange={(e) =>
                        setImportMode(e.target.value as ImportMode)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>{t("replaceMode")}</strong> -{" "}
                      {t("replaceModeDesc")}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === "merge"}
                      onChange={(e) =>
                        setImportMode(e.target.value as ImportMode)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>{t("mergeMode")}</strong> - {t("mergeModeDesc")}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isImporting && (
                  <p className="mt-2 text-sm text-gray-500">{t("importing")}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <p className="text-sm font-medium">{message.text}</p>
            {message.type === "error" && (
              <p className="text-xs mt-1">{t("filePersistError")}</p>
            )}
          </div>
        )}

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("resetAlerts")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t("resetAlertsDesc")}
            </p>
            <Button onClick={handleResetAlerts} variant="outline">
              {t("resetAlertsButton")}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("cautions")}
            </h2>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>{t("caution1")}</li>
              <li>{t("caution2")}</li>
              <li>{t("caution3")}</li>
              <li>{t("caution4")}</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

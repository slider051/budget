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

type Message = { type: "success" | "error"; text: string } | null;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        {description ? <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{description}</p> : null}
        {children}
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("settings");
  const [importMode, setImportMode] = useState<ImportMode>("replace");
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const showMessage = (next: Exclude<Message, null>) => {
    setMessage(next);
    setTimeout(() => setMessage(null), next.type === "success" ? 4000 : 5000);
  };

  const handleExport = async () => {
    try {
      await downloadBackup();
      showMessage({ type: "success", text: t("backupSuccess") });
    } catch (error) {
      showMessage({
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
      if (!result.success) return showMessage({ type: "error", text: result.message });
      showMessage({
        type: "success",
        text: t("importSuccess", {
          message: result.message,
          transactions: result.imported?.transactions ?? 0,
          budgets: result.imported?.budgets ?? 0,
          subscriptions: result.imported?.subscriptions ?? 0,
        }),
      });
    } catch (error) {
      showMessage({
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

  const themeOptions = [
    { value: "system" as const, label: "System", desc: t("themeSystem") },
    { value: "light" as const, label: "Light", desc: t("themeLight") },
    { value: "dark" as const, label: "Dark", desc: t("themeDark") },
  ];
  const modeOptions = [
    { value: "replace" as const, title: t("replaceMode"), desc: t("replaceModeDesc") },
    { value: "merge" as const, title: t("mergeMode"), desc: t("mergeModeDesc") },
  ];

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="max-w-3xl space-y-6">
        <Section title={t("theme")} description={t("themeDesc")}>
          <div className="space-y-2">
            {themeOptions.map((item) => (
              <label key={item.value} className="flex items-center">
                <input type="radio" name="theme" value={item.value} checked={theme === item.value} onChange={() => setTheme(item.value)} className="mr-2" />
                <span className="text-sm dark:text-gray-300">
                  <strong>{item.label}</strong> - {item.desc}
                </span>
              </label>
            ))}
          </div>
        </Section>

        <Section title={t("backup")} description={t("backupDesc")}>
          <Button onClick={handleExport}>{t("exportBackup")}</Button>
        </Section>

        <Section title={t("restore")} description={t("restoreDesc")}>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("importMode")}</label>
              <div className="space-y-2">
                {modeOptions.map((item) => (
                  <label key={item.value} className="flex items-center">
                    <input type="radio" name="importMode" value={item.value} checked={importMode === item.value} onChange={() => setImportMode(item.value)} className="mr-2" />
                    <span className="text-sm dark:text-gray-300">
                      <strong>{item.title}</strong> - {item.desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isImporting ? <p className="text-sm text-gray-500 dark:text-gray-400">{t("importing")}</p> : null}
          </div>
        </Section>

        {message ? (
          <div className={`rounded-lg border p-4 ${message.type === "success" ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}`}>
            <p className="text-sm font-medium">{message.text}</p>
            {message.type === "error" ? <p className="mt-1 text-xs">{t("filePersistError")}</p> : null}
          </div>
        ) : null}

        <Section title={t("resetAlerts")} description={t("resetAlertsDesc")}>
          <Button
            onClick={() => {
              clearAllAlerts();
              showMessage({ type: "success", text: t("alertsResetSuccess") });
            }}
            variant="outline"
          >
            {t("resetAlertsButton")}
          </Button>
        </Section>

        <Section title={t("cautions")}>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>{t("caution1")}</li>
            <li>{t("caution2")}</li>
            <li>{t("caution3")}</li>
            <li>{t("caution4")}</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

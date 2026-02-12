"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { downloadBackup, importBackup } from "@/lib/backup/backupRepository";
import { clearAllAlerts } from "@/lib/alerts/budgetAlerts";
import { useTheme } from "@/hooks/useTheme";
import type { ImportMode } from "@/types/backup";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [importMode, setImportMode] = useState<ImportMode>("replace");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    try {
      downloadBackup();
      setMessage({
        type: "success",
        text: "백업 파일이 다운로드되었습니다",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Export 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
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
      const result = importBackup(text, importMode);

      if (result.success) {
        setMessage({
          type: "success",
          text: `${result.message} (거래: ${result.imported?.transactions ?? 0}, 예산: ${result.imported?.budgets ?? 0}, 구독: ${result.imported?.subscriptions ?? 0})`,
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({
          type: "error",
          text: result.message,
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `파일 읽기 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handleResetAlerts = () => {
    clearAllAlerts();
    setMessage({
      type: "success",
      text: "예산 알림이 초기화되었습니다",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your data and preferences"
      />

      <div className="space-y-6 max-w-3xl">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              테마 설정
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              화면 테마를 선택하세요. 시스템 설정에 따르거나 수동으로 선택할 수
              있습니다.
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
                  <strong>System</strong> - 시스템 설정 따르기
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
                  <strong>Light</strong> - 라이트 모드
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
                  <strong>Dark</strong> - 다크 모드
                </span>
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              데이터 백업
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              모든 거래 내역과 예산 데이터를 JSON 파일로 다운로드합니다.
              브라우저 데이터가 삭제되기 전에 정기적으로 백업하세요.
            </p>
            <Button onClick={handleExport}>Export 백업 파일 다운로드</Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              데이터 복원
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              백업 파일을 업로드하여 데이터를 복원합니다.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import 모드
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
                      <strong>Replace (전체 덮어쓰기)</strong> - 기존 데이터를
                      모두 삭제하고 백업 파일로 교체합니다
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
                      <strong>Merge (병합)</strong> - 기존 데이터를 유지하고
                      백업 파일의 데이터를 추가/업데이트합니다
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
                  <p className="mt-2 text-sm text-gray-500">
                    Import 중입니다...
                  </p>
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
              <p className="text-xs mt-1">
                문제가 계속되면 백업 파일이 손상되었는지 확인하세요.
              </p>
            )}
          </div>
        )}

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              예산 알림 초기화
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              예산 90% 초과 알림을 모두 초기화합니다. 다시 알림을 받을 수
              있습니다.
            </p>
            <Button onClick={handleResetAlerts} variant="outline">
              알림 초기화
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              주의사항
            </h2>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Replace 모드는 현재 데이터를 완전히 삭제합니다</li>
              <li>Merge 모드는 동일 ID/월 데이터를 백업 파일로 덮어씁니다</li>
              <li>백업 파일은 안전한 장소에 보관하세요</li>
              <li>
                다른 기기로 이동 시 백업 파일을 사용하여 데이터를 옮길 수
                있습니다
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

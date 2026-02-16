"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { applyYearTemplate, upsertBudget } from "@/lib/budget/budgetRepository";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface BudgetEditModalProps {
  month: string;
  initialCategories?: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function createManWonCategories(initialCategories: Record<string, number>) {
  const initial: Record<string, number> = {};
  for (const category of EXPENSE_CATEGORIES) {
    const wonAmount = initialCategories[category] ?? 0;
    initial[category] = Math.round(wonAmount / 10000);
  }
  return initial;
}

function toWonCategories(categories: Record<string, number>) {
  const next: Record<string, number> = {};
  for (const [category, manWon] of Object.entries(categories)) {
    next[category] = manWon * 10000;
  }
  return next;
}

function BudgetEditModalContent({
  month,
  initialCategories = {},
  onClose,
  onSaved,
}: Omit<BudgetEditModalProps, "isOpen">) {
  const [showYearTemplate, setShowYearTemplate] = useState(false);
  const [templateYear, setTemplateYear] = useState(new Date().getFullYear());
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Record<string, number>>(() =>
    createManWonCategories(initialCategories),
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await upsertBudget(month, toWonCategories(categories));
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert("예산 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyYear = async () => {
    const confirmed = window.confirm(
      `${templateYear}년 1~12월 예산을 현재 값으로 덮어씁니다. 계속할까요?`,
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      await applyYearTemplate(templateYear, toWonCategories(categories));
      alert(`${templateYear}년 1~12월 예산이 적용되었습니다.`);
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert("연간 템플릿 적용 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4 backdrop-blur-[1px]">
      <div className="isolate max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-30 rounded-t-2xl border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">{month} 예산 설정</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">카테고리별 예산</h3>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
                단위: 만원
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {EXPENSE_CATEGORIES.map((category) => (
                <div key={category} className="mx-auto w-full max-w-[9rem] min-w-0">
                  <Input
                    label={category}
                    type="number"
                    min="0"
                    value={categories[category] || 0}
                    onChange={(e) =>
                      setCategories((prev) => ({
                        ...prev,
                        [category]: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    placeholder="0"
                    className="px-2 py-1.5 text-right"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-300 bg-slate-50/70 p-4">
            <button
              type="button"
              onClick={() => setShowYearTemplate((prev) => !prev)}
              className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900"
            >
              연간 템플릿 적용
            </button>

            {showYearTemplate ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
                <p className="mb-3 text-sm text-amber-900">
                  현재 금액을 선택한 연도의 1~12월에 모두 적용합니다.
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <Input
                    label="연도"
                    type="number"
                    min="2020"
                    max="2030"
                    className="w-28"
                    value={templateYear}
                    onChange={(e) => setTemplateYear(parseInt(e.target.value, 10))}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyYear}
                    className="mb-0 border-orange-300 text-orange-700 hover:bg-orange-50"
                    disabled={isSaving}
                  >
                    {templateYear}년 전체 적용
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="sticky bottom-0 z-30 flex gap-3 rounded-b-2xl border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-6px_16px_rgba(15,23,42,0.06)]">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
            {isSaving ? "저장 중.." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetEditModal(props: BudgetEditModalProps) {
  if (!props.isOpen) return null;
  return <BudgetEditModalContent key={props.month} {...props} />;
}

"use client";

import { useState } from "react";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { upsertBudget, applyYearTemplate } from "@/lib/budget/budgetRepository";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface BudgetEditModalProps {
  month: string;
  initialCategories?: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function BudgetEditModalContent({
  month,
  initialCategories = {},
  onClose,
  onSaved,
}: Omit<BudgetEditModalProps, "isOpen">) {
  const [showYearTemplate, setShowYearTemplate] = useState(false);
  const [templateYear, setTemplateYear] = useState(new Date().getFullYear());

  const [categories, setCategories] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach((cat) => {
      // Convert from won to 만원 (divide by 10,000)
      const wonAmount = initialCategories[cat] ?? 0;
      initial[cat] = Math.round(wonAmount / 10000);
    });
    return initial;
  });

  const handleSave = () => {
    // Convert from 만원 to won (multiply by 10,000)
    const categoriesInWon: Record<string, number> = {};
    Object.entries(categories).forEach(([cat, manWon]) => {
      categoriesInWon[cat] = manWon * 10000;
    });
    upsertBudget(month, categoriesInWon);
    onSaved();
    onClose();
  };

  const handleApplyYear = () => {
    // Convert from 만원 to won (multiply by 10,000)
    const categoriesInWon: Record<string, number> = {};
    Object.entries(categories).forEach(([cat, manWon]) => {
      categoriesInWon[cat] = manWon * 10000;
    });
    applyYearTemplate(templateYear, categoriesInWon);
    alert(`${templateYear}년 1~12월 예산이 설정되었습니다.`);
    onSaved();
    onClose();
  };

  const handleCategoryChange = (category: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCategories({
      ...categories,
      [category]: numValue,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {month} 예산 설정
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

        <div className="px-6 py-6 space-y-6">
          {/* Category Inputs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                카테고리별 예산
              </h3>
              <span className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full">
                단위: 만원 (예: 30 = 30만원)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXPENSE_CATEGORIES.map((category) => (
                <div key={category} className="relative">
                  <Input
                    label={`${category} (만원)`}
                    type="number"
                    min="0"
                    value={categories[category] || 0}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.value)
                    }
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Year Template Section */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowYearTemplate(!showYearTemplate)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              연간 템플릿 적용
            </button>

            {showYearTemplate && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
                <p className="text-sm text-indigo-900 mb-3">
                  위 금액을 선택한 연도의 1~12월에 모두 적용합니다.
                </p>
                <div className="flex items-end gap-3">
                  <Input
                    label="연도"
                    type="number"
                    min="2020"
                    max="2030"
                    value={templateYear}
                    onChange={(e) => setTemplateYear(parseInt(e.target.value))}
                  />
                  <Button onClick={handleApplyYear} className="mb-0">
                    {templateYear}년 전체 적용
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button onClick={handleSave} className="flex-1">
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetEditModal(props: BudgetEditModalProps) {
  if (!props.isOpen) return null;

  // Use key to reset state when month changes
  return <BudgetEditModalContent key={props.month} {...props} />;
}

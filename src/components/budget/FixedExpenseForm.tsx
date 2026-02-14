"use client";

import { useState } from "react";
import { useBudget } from "@/hooks/useBudget";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { FixedExpenseInput } from "@/types/budget";

export default function FixedExpenseForm() {
  const { addFixedExpenses } = useBudget();
  const [formData, setFormData] = useState<FixedExpenseInput>({
    amount: 0,
    category: EXPENSE_CATEGORIES[0],
    description: "",
    dayOfMonth: 1,
    startMonth: 1,
    endMonth: 12,
    year: new Date().getFullYear(),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addFixedExpenses(formData);

      alert(`${formData.endMonth - formData.startMonth + 1}개의 고정 지출이 생성되었습니다.`);

      setFormData({
        amount: 0,
        category: EXPENSE_CATEGORIES[0],
        description: "",
        dayOfMonth: 1,
        startMonth: 1,
        endMonth: 12,
        year: new Date().getFullYear(),
      });
    } catch (error) {
      alert("오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}월`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">고정 지출 정보</h3>

        <div className="space-y-4">
          <Input
            label="금액"
            type="number"
            min="0"
            required
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData({ ...formData, amount: Number(e.target.value) })
            }
            placeholder="50000"
          />

          <Select
            label="카테고리"
            required
            options={categoryOptions}
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />

          <Input
            label="설명"
            type="text"
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="넷플릭스 구독료"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">반복 설정</h3>

        <div className="space-y-4">
          <Input
            label="매월 날짜"
            type="number"
            min="1"
            max="31"
            required
            value={formData.dayOfMonth}
            onChange={(e) =>
              setFormData({ ...formData, dayOfMonth: Number(e.target.value) })
            }
            placeholder="1"
          />

          <Input
            label="연도"
            type="number"
            min="2020"
            max="2030"
            required
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: Number(e.target.value) })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="시작 월"
              required
              options={monthOptions}
              value={String(formData.startMonth)}
              onChange={(e) =>
                setFormData({ ...formData, startMonth: Number(e.target.value) })
              }
            />

            <Select
              label="종료 월"
              required
              options={monthOptions}
              value={String(formData.endMonth)}
              onChange={(e) =>
                setFormData({ ...formData, endMonth: Number(e.target.value) })
              }
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">생성될 거래 수</span>
          <span className="text-lg font-bold text-indigo-600">
            {formData.endMonth - formData.startMonth + 1}개
          </span>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "생성 중..." : "고정 지출 일괄 생성"}
        </Button>
      </div>
    </form>
  );
}

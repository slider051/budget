"use client";

import { useState } from "react";
import { useBudget } from "@/hooks/useBudget";
import { validateTransaction } from "@/lib/validation";
import { getTodayString } from "@/lib/formatters";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/constants";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { TransactionType } from "@/types/budget";

export default function TransactionForm() {
  const { addTransaction } = useBudget();

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const validated = validateTransaction({
        type,
        amount: Number(amount),
        category,
        description,
        date,
      });

      await addTransaction(validated);

      setAmount("");
      setCategory("");
      setDescription("");
      setDate(getTodayString());
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("입력값을 확인해주세요");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: "", label: "선택하세요" },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  return (
    <Card>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">새 거래 추가</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="income"
              checked={type === "income"}
              onChange={(e) => {
                setType(e.target.value as TransactionType);
                setCategory("");
              }}
              className="h-4 w-4"
            />
            <span className="text-gray-700">수입</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="expense"
              checked={type === "expense"}
              onChange={(e) => {
                setType(e.target.value as TransactionType);
                setCategory("");
              }}
              className="h-4 w-4"
            />
            <span className="text-gray-700">지출</span>
          </label>
        </div>

        <Input
          label="금액"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10000"
          required
          min="1"
        />

        <Select
          label="카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          options={categoryOptions}
        />

        <Input
          label="설명"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="상세 내용 (선택사항)"
          maxLength={200}
        />

        <Input
          label="날짜"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "저장 중..." : "추가하기"}
        </Button>
      </form>
    </Card>
  );
}

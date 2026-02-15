import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAnnualAnalysisPayload,
  parseAnalysisYear,
} from "../src/lib/analysis/annualApi.ts";
import type { MonthlyBudget } from "../src/types/monthlyBudget.ts";
import type { Transaction } from "../src/types/budget.ts";

test("parseAnalysisYear uses fallback for null and invalid values", () => {
  assert.equal(parseAnalysisYear(null, 2026), 2026);
  assert.equal(parseAnalysisYear("abc", 2026), 2026);
  assert.equal(parseAnalysisYear("2027", 2026), 2027);
});

test("buildAnnualAnalysisPayload aggregates income, expense, and budgets", () => {
  const transactions: Transaction[] = [
    {
      id: "t1",
      type: "income",
      amount: 1000,
      category: "Salary",
      description: "",
      date: "2026-01-03",
      createdAt: "2026-01-03T00:00:00.000Z",
    },
    {
      id: "t2",
      type: "expense",
      amount: 200,
      category: "Food",
      description: "",
      date: "2026-01-05",
      createdAt: "2026-01-05T00:00:00.000Z",
    },
    {
      id: "t3",
      type: "expense",
      amount: 100,
      category: "Food",
      description: "",
      date: "2026-02-10",
      createdAt: "2026-02-10T00:00:00.000Z",
    },
  ];

  const budgets: MonthlyBudget[] = [
    {
      month: "2026-01",
      categories: { Food: 500, Transport: 300 },
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  const payload = buildAnnualAnalysisPayload(2026, transactions, budgets);

  assert.equal(payload.summary.totalIncome, 1000);
  assert.equal(payload.summary.totalExpense, 300);
  assert.equal(payload.summary.netSavings, 700);
  assert.equal(payload.monthlySummaries[0]?.budget, 800);
  assert.equal(payload.monthlySummaries[0]?.expense, 200);
  assert.equal(payload.monthlySummaries[1]?.expense, 100);
  assert.equal(payload.expenseTotals[0]?.category, "Food");
  assert.equal(payload.expenseTotals[0]?.amount, 300);
  assert.equal(payload.incomeTotals[0]?.category, "Salary");
  assert.equal(payload.incomeTotals[0]?.amount, 1000);
});

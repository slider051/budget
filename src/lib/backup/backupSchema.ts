import { z } from "zod";

const SUPPORTED_VERSIONS = ["1.0.0"];

const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(["income", "expense"]),
  amount: z.number().nonnegative(),
  category: z.string().min(1),
  description: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string(),
});

const monthlyBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  categories: z.record(z.string(), z.number().nonnegative()),
  updatedAt: z.string(),
});

export const backupDataSchema = z.object({
  version: z.string().refine((v) => SUPPORTED_VERSIONS.includes(v), {
    message: `지원하지 않는 백업 버전입니다. 지원 버전: ${SUPPORTED_VERSIONS.join(", ")}`,
  }),
  exportedAt: z.string(),
  transactions: z.array(transactionSchema),
  budgets: z.array(monthlyBudgetSchema),
});

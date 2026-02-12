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

const subscriptionAccountSchema = z.object({
  id: z.string(),
  alias: z.string(),
  accountLabel: z.string(),
  discountType: z.enum(["none", "percent30", "percent50", "free"]),
  customPrice: z.number().nonnegative().nullable(),
  memo: z.string(),
});

const subscriptionSchema = z.object({
  id: z.string(),
  serviceKey: z.string(),
  serviceName: z.string().min(1),
  category: z.enum(["ott", "ai", "shopping", "music", "reading", "other"]),
  logoUrl: z.string().optional().default(""),
  defaultPrice: z.number().nonnegative().optional(),
  actualPrice: z.number().nonnegative().optional(),
  participantCount: z.number().int().positive().optional().default(1),
  basePrice: z.number().nonnegative().optional(),
  currency: z.enum(["KRW", "USD", "JPY"]),
  billingCycle: z.enum(["monthly", "custom", "yearly"]),
  customCycleMonths: z.number().int().positive().nullable().optional().default(null),
  billingStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .default(null),
  accountName: z.string().optional().default(""),
  customCycleEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .default(null),
  customCycleDays: z.number().int().positive().nullable().optional().default(null),
  billingAnchorDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  autoRenew: z.boolean().optional().default(true),
  expectedEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .default(null),
  memo: z.string().optional().default(""),
  accounts: z.array(subscriptionAccountSchema).optional().default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupDataSchema = z.object({
  version: z.string().refine((v) => SUPPORTED_VERSIONS.includes(v), {
    message: `지원하지 않는 백업 버전입니다. 지원 버전: ${SUPPORTED_VERSIONS.join(", ")}`,
  }),
  exportedAt: z.string(),
  transactions: z.array(transactionSchema),
  budgets: z.array(monthlyBudgetSchema),
  subscriptions: z.array(subscriptionSchema).optional().default([]),
});

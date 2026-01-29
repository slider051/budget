import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('금액은 0보다 커야 합니다').max(1000000000, '금액이 너무 큽니다'),
  category: z.string().min(1, '카테고리를 선택해주세요').max(50, '카테고리 이름이 너무 깁니다'),
  description: z.string().max(200, '설명은 200자 이하로 입력해주세요'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export function validateTransaction(data: unknown): TransactionInput {
  return transactionSchema.parse(data);
}

import { z } from "zod";
import { ApiRouteError } from "./errors.ts";

const analysisYearSchema = z.coerce.number().int().min(2000).max(2100);
const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM format.");

export function parseAnalysisYearForApi(
  yearParam: string | null,
  fallbackYear: number,
): number {
  if (!yearParam || yearParam.trim() === "") {
    return fallbackYear;
  }

  const parsed = analysisYearSchema.safeParse(yearParam);
  if (parsed.success) {
    return parsed.data;
  }

  throw new ApiRouteError({
    status: 400,
    code: "VALIDATION_ERROR",
    userMessage: "Invalid year. Use YYYY between 2000 and 2100.",
    logMessage: parsed.error.message,
  });
}

export function parseYearMonthForApi(
  yearMonthParam: string | null,
  fallbackYearMonth: string,
): string {
  if (!yearMonthParam || yearMonthParam.trim() === "") {
    return fallbackYearMonth;
  }

  const parsed = yearMonthSchema.safeParse(yearMonthParam.trim());
  if (parsed.success) {
    return parsed.data;
  }

  throw new ApiRouteError({
    status: 400,
    code: "VALIDATION_ERROR",
    userMessage: "Invalid yearMonth. Use YYYY-MM.",
    logMessage: parsed.error.message,
  });
}

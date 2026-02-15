import { ZodError } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

interface PostgrestErrorLike {
  code?: string;
  message: string;
  details?: string | null;
  hint?: string | null;
}

interface ApiRouteErrorInput {
  status: number;
  code: ApiErrorCode;
  userMessage: string;
  logMessage?: string;
  details?: Record<string, unknown>;
}

const POSTGREST_ERROR_MAP: Record<
  string,
  { status: number; code: ApiErrorCode; userMessage: string }
> = {
  "22007": {
    status: 400,
    code: "BAD_REQUEST",
    userMessage: "Invalid date or time format.",
  },
  "22P02": {
    status: 400,
    code: "BAD_REQUEST",
    userMessage: "Invalid input format.",
  },
  "23503": {
    status: 400,
    code: "BAD_REQUEST",
    userMessage: "Related data was not found.",
  },
  "23505": {
    status: 409,
    code: "CONFLICT",
    userMessage: "Request conflicts with existing data.",
  },
  "23514": {
    status: 400,
    code: "BAD_REQUEST",
    userMessage: "Request violates data constraints.",
  },
};

export class ApiRouteError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly userMessage: string;
  readonly logMessage: string;
  readonly details?: Record<string, unknown>;

  constructor(input: ApiRouteErrorInput) {
    super(input.logMessage ?? input.userMessage);
    this.name = "ApiRouteError";
    this.status = input.status;
    this.code = input.code;
    this.userMessage = input.userMessage;
    this.logMessage = input.logMessage ?? input.userMessage;
    this.details = input.details;
  }
}

function isPostgrestErrorLike(value: unknown): value is PostgrestErrorLike {
  if (!value || typeof value !== "object") return false;
  if (!("message" in value)) return false;
  const hasMessage =
    typeof (value as { message?: unknown }).message === "string";
  const hasPostgrestMarkers =
    "code" in value || "details" in value || "hint" in value;
  return hasMessage && hasPostgrestMarkers;
}

export function mapToApiRouteError(
  error: unknown,
  fallbackUserMessage = "Internal server error.",
): ApiRouteError {
  if (error instanceof ApiRouteError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ApiRouteError({
      status: 400,
      code: "VALIDATION_ERROR",
      userMessage: "Invalid request parameters.",
      logMessage: error.message,
      details: { issues: error.issues },
    });
  }

  if (isPostgrestErrorLike(error)) {
    const matched = error.code ? POSTGREST_ERROR_MAP[error.code] : undefined;
    if (matched) {
      return new ApiRouteError({
        status: matched.status,
        code: matched.code,
        userMessage: matched.userMessage,
        logMessage: error.message,
        details: {
          dbCode: error.code ?? "unknown",
          details: error.details ?? null,
          hint: error.hint ?? null,
        },
      });
    }

    return new ApiRouteError({
      status: 500,
      code: "DATABASE_ERROR",
      userMessage: fallbackUserMessage,
      logMessage: error.message,
      details: {
        dbCode: error.code ?? "unknown",
        details: error.details ?? null,
        hint: error.hint ?? null,
      },
    });
  }

  if (error instanceof Error) {
    return new ApiRouteError({
      status: 500,
      code: "INTERNAL_ERROR",
      userMessage: fallbackUserMessage,
      logMessage: error.message,
    });
  }

  return new ApiRouteError({
    status: 500,
    code: "INTERNAL_ERROR",
    userMessage: fallbackUserMessage,
    logMessage: String(error),
  });
}

export function buildApiErrorBody(
  error: ApiRouteError,
  options?: { includeOk?: boolean },
): { ok?: false; error: string; code: ApiErrorCode } {
  if (options?.includeOk === false) {
    return { error: error.userMessage, code: error.code };
  }

  return {
    ok: false,
    error: error.userMessage,
    code: error.code,
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import {
  ApiRouteError,
  buildApiErrorBody,
  mapToApiRouteError,
} from "../src/lib/api/errors.ts";

test("mapToApiRouteError maps zod error to validation response", () => {
  let captured: unknown;
  try {
    z.object({ year: z.number().int() }).parse({ year: "2026" });
  } catch (error) {
    captured = error;
  }

  const mapped = mapToApiRouteError(captured);
  assert.equal(mapped.status, 400);
  assert.equal(mapped.code, "VALIDATION_ERROR");
  assert.equal(mapped.userMessage, "Invalid request parameters.");
});

test("mapToApiRouteError maps database conflict code", () => {
  const mapped = mapToApiRouteError({
    code: "23505",
    message: "duplicate key value violates unique constraint",
  });

  assert.equal(mapped.status, 409);
  assert.equal(mapped.code, "CONFLICT");
  assert.equal(mapped.userMessage, "Request conflicts with existing data.");
});

test("mapToApiRouteError returns internal error for unknown error", () => {
  const mapped = mapToApiRouteError(new Error("boom"));

  assert.equal(mapped.status, 500);
  assert.equal(mapped.code, "INTERNAL_ERROR");
  assert.equal(mapped.userMessage, "Internal server error.");
});

test("buildApiErrorBody includes ok=false by default", () => {
  const body = buildApiErrorBody(
    new ApiRouteError({
      status: 400,
      code: "VALIDATION_ERROR",
      userMessage: "Bad input",
    }),
  );

  assert.deepEqual(body, {
    ok: false,
    error: "Bad input",
    code: "VALIDATION_ERROR",
  });
});

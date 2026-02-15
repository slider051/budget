import test from "node:test";
import assert from "node:assert/strict";
import { ApiRouteError } from "../src/lib/api/errors.ts";
import {
  parseAnalysisYearForApi,
  parseYearMonthForApi,
} from "../src/lib/api/validators.ts";

test("parseAnalysisYearForApi returns fallback when input is empty", () => {
  assert.equal(parseAnalysisYearForApi(null, 2026), 2026);
  assert.equal(parseAnalysisYearForApi("  ", 2026), 2026);
});

test("parseAnalysisYearForApi parses valid year", () => {
  assert.equal(parseAnalysisYearForApi("2025", 2026), 2025);
});

test("parseAnalysisYearForApi throws ApiRouteError for invalid year", () => {
  assert.throws(
    () => parseAnalysisYearForApi("1900", 2026),
    (error: unknown) => {
      assert.equal(error instanceof ApiRouteError, true);
      assert.equal((error as ApiRouteError).status, 400);
      assert.equal((error as ApiRouteError).code, "VALIDATION_ERROR");
      return true;
    },
  );
});

test("parseYearMonthForApi returns fallback when input is empty", () => {
  assert.equal(parseYearMonthForApi(null, "2026-02"), "2026-02");
  assert.equal(parseYearMonthForApi("", "2026-02"), "2026-02");
});

test("parseYearMonthForApi parses valid yearMonth", () => {
  assert.equal(parseYearMonthForApi("2026-12", "2026-02"), "2026-12");
});

test("parseYearMonthForApi throws ApiRouteError for invalid yearMonth", () => {
  assert.throws(
    () => parseYearMonthForApi("2026-13", "2026-02"),
    (error: unknown) => {
      assert.equal(error instanceof ApiRouteError, true);
      assert.equal((error as ApiRouteError).status, 400);
      assert.equal((error as ApiRouteError).code, "VALIDATION_ERROR");
      return true;
    },
  );
});

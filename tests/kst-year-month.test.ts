import test from "node:test";
import assert from "node:assert/strict";
import { getKstYearMonth } from "../src/lib/time/kst.ts";

test("returns previous month at KST month-end 23:59", () => {
  const value = getKstYearMonth(new Date("2026-01-31T14:59:00.000Z"));
  assert.equal(value, "2026-01");
});

test("returns next month at KST month-start 00:01", () => {
  const value = getKstYearMonth(new Date("2026-01-31T15:01:00.000Z"));
  assert.equal(value, "2026-02");
});

test("throws for invalid dates", () => {
  const invalid = new Date("not-a-date");
  assert.throws(() => getKstYearMonth(invalid), /Invalid date/);
});

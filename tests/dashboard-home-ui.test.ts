import test from "node:test";
import assert from "node:assert/strict";
import {
  getDashboardHeroTitle,
  getDashboardMonthBadge,
} from "../src/lib/dashboard/homeUi.ts";

test("getDashboardHeroTitle returns fixed Korean copy for ko locale", () => {
  assert.equal(getDashboardHeroTitle("ko"), "예산을 쉽게 관리해보세요");
});

test("getDashboardHeroTitle falls back to english for non-ko locale", () => {
  assert.equal(getDashboardHeroTitle("en"), "Manage your budget easily");
  assert.equal(getDashboardHeroTitle("ja"), "Manage your budget easily");
});

test("getDashboardMonthBadge formats Korean month badge", () => {
  const value = getDashboardMonthBadge("ko", "2026-02", new Date("2026-02-03"));
  assert.equal(value, "Qoint | 2월 포커스");
});

test("getDashboardMonthBadge formats English month badge", () => {
  const value = getDashboardMonthBadge("en", "2026-02", new Date("2026-02-03"));
  assert.equal(value, "Qoint | February Focus");
});

test("getDashboardMonthBadge uses fallback date when selectedMonth is invalid", () => {
  const value = getDashboardMonthBadge("ko", "invalid", new Date("2026-11-03"));
  assert.equal(value, "Qoint | 11월 포커스");
});

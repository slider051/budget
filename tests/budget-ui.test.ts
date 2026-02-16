import test from "node:test";
import assert from "node:assert/strict";
import {
  getUsagePercent,
  getUsageVisualState,
  getProgressWidthPercent,
} from "../src/lib/budget/budgetUi.ts";

test("getUsagePercent returns null when budget is zero or below", () => {
  assert.equal(getUsagePercent(1000, 0), null);
  assert.equal(getUsagePercent(1000, -1), null);
});

test("getUsagePercent calculates percentage when budget exists", () => {
  assert.equal(getUsagePercent(20000, 50000), 40);
});

test("getUsageVisualState maps thresholds to ok/warning/over", () => {
  assert.equal(getUsageVisualState(null), "unset");
  assert.equal(getUsageVisualState(80), "ok");
  assert.equal(getUsageVisualState(80.1), "warning");
  assert.equal(getUsageVisualState(99.9), "warning");
  assert.equal(getUsageVisualState(100), "over");
});

test("getProgressWidthPercent clamps range to 0..100", () => {
  assert.equal(getProgressWidthPercent(null), 0);
  assert.equal(getProgressWidthPercent(-10), 0);
  assert.equal(getProgressWidthPercent(45.8), 45.8);
  assert.equal(getProgressWidthPercent(170), 100);
});

import test from "node:test";
import assert from "node:assert/strict";
import { isLocaleRootPath } from "../src/lib/routing/shellRoute.ts";

test("isLocaleRootPath returns true for locale root paths", () => {
  assert.equal(isLocaleRootPath("/ko"), true);
  assert.equal(isLocaleRootPath("/en"), true);
  assert.equal(isLocaleRootPath("/ko/"), true);
  assert.equal(isLocaleRootPath("/en/"), true);
});

test("isLocaleRootPath returns false for non-root paths", () => {
  assert.equal(isLocaleRootPath("/ko/settings"), false);
  assert.equal(isLocaleRootPath("/en/budget"), false);
  assert.equal(isLocaleRootPath("/"), false);
  assert.equal(isLocaleRootPath("/login"), false);
  assert.equal(isLocaleRootPath(null), false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { isApiPath, isSuspiciousApiPath } from "../src/lib/security/pathGuard.ts";

test("isApiPath accepts /api and /api/* paths only", () => {
  assert.equal(isApiPath("/api"), true);
  assert.equal(isApiPath("/api/cron/monthly-subscription"), true);
  assert.equal(isApiPath("/analysis"), false);
  assert.equal(isApiPath("/"), false);
});

test("isSuspiciousApiPath detects common exploit paths", () => {
  assert.equal(isSuspiciousApiPath("/api/.env"), true);
  assert.equal(isSuspiciousApiPath("/api/.git/config"), true);
  assert.equal(isSuspiciousApiPath("/api/wp-admin"), true);
  assert.equal(isSuspiciousApiPath("/api/phpmyadmin"), true);
  assert.equal(isSuspiciousApiPath("/api/xmlrpc.php"), true);
});

test("isSuspiciousApiPath detects encoded traversal patterns", () => {
  assert.equal(isSuspiciousApiPath("/api/%2e%2e/%2e%2e/etc/passwd"), true);
  assert.equal(isSuspiciousApiPath("/api/%2f%2e"), true);
  assert.equal(isSuspiciousApiPath("/api/%5cwindows"), true);
});

test("isSuspiciousApiPath allows normal API paths", () => {
  assert.equal(isSuspiciousApiPath("/api/analysis/annual"), false);
  assert.equal(isSuspiciousApiPath("/api/cron/monthly-subscription"), false);
  assert.equal(isSuspiciousApiPath("/api/transactions"), false);
});

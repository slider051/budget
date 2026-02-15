import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOpsAlertMessage,
  sendOpsAlert,
} from "../src/lib/alerts/opsAlert.ts";

test("buildOpsAlertMessage includes severity, source, and details", () => {
  const message = buildOpsAlertMessage({
    severity: "critical",
    source: "cron/monthly-subscription",
    message: "RPC failed",
    details: {
      yearMonth: "2026-02",
      requestId: "req-1",
    },
  });

  assert.equal(message.includes("[CRITICAL]"), true);
  assert.equal(message.includes("cron/monthly-subscription"), true);
  assert.equal(message.includes("RPC failed"), true);
  assert.equal(message.includes("yearMonth"), true);
});

test("sendOpsAlert returns false when webhook env is missing", async () => {
  delete process.env.OPS_ALERT_WEBHOOK_URL;
  delete process.env.OPS_ALERT_WEBHOOK_URL_CRITICAL;
  delete process.env.OPS_ALERT_WEBHOOK_URL_ERROR;
  delete process.env.OPS_ALERT_WEBHOOK_URL_WARN;
  const result = await sendOpsAlert({
    severity: "warn",
    source: "analysis/annual",
    message: "fallback path used",
  });
  assert.equal(result, false);
});

test("sendOpsAlert posts message when webhook env exists", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  process.env.OPS_ALERT_WEBHOOK_URL = "https://example.com/webhook";

  const result = await sendOpsAlert(
    {
      severity: "error",
      source: "cron/monthly-subscription",
      message: "batch failed",
      details: { requestId: "req-2" },
    },
    {
      fetcher: async (input, init) => {
        calls.push({ url: String(input), init });
        return new Response("", { status: 200 });
      },
    },
  );

  assert.equal(result, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "https://example.com/webhook");
  assert.equal(calls[0]?.init?.method, "POST");
});

test("sendOpsAlert prefers severity-specific webhook url", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  process.env.OPS_ALERT_WEBHOOK_URL = "https://example.com/default";
  process.env.OPS_ALERT_WEBHOOK_URL_CRITICAL = "https://example.com/critical";
  delete process.env.OPS_ALERT_WEBHOOK_URL_ERROR;
  delete process.env.OPS_ALERT_WEBHOOK_URL_WARN;

  const result = await sendOpsAlert(
    {
      severity: "critical",
      source: "cron/monthly-subscription",
      message: "critical path",
    },
    {
      fetcher: async (input, init) => {
        calls.push({ url: String(input), init });
        return new Response("", { status: 200 });
      },
    },
  );

  assert.equal(result, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "https://example.com/critical");
});

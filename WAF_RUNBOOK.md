# Vercel WAF Runbook

This project already has app-level protection in middleware:
- suspicious API path filter
- rate limiting for `/api/*` and `/api/cron/*`

Use this runbook to apply dashboard-level protection in Vercel and capture 24h evidence.

## 1) Pre-check

1. Confirm these env values in Vercel (Production):
- `API_RATE_LIMIT_WINDOW_MS`
- `API_RATE_LIMIT_MAX`
- `CRON_RATE_LIMIT_MAX`
- `SECURITY_LOG_BLOCKED_REQUESTS`

2. Confirm middleware protection is active by checking function logs:
- look for `"[api-protection] blocked"` entries after a test request.

## 2) Recommended WAF Rules (Production)

Create these in `Vercel Dashboard -> Project -> Firewall`.

1. `block-suspicious-paths`
- Condition: request path contains one of:
  - `/.env`
  - `/.git`
  - `wp-admin`
  - `wp-login`
  - `xmlrpc.php`
  - `phpmyadmin`
  - `.php`
  - `../`
- Action: `Block`

2. `rate-limit-api`
- Condition: path starts with `/api/`
- Action: `Rate limit`
- Initial threshold: `120 req / 1 min / IP`

3. `rate-limit-cron`
- Condition: path starts with `/api/cron/`
- Action: `Rate limit`
- Initial threshold: `20 req / 1 min / IP`

4. Optional `block-known-scanner-ua`
- Apply only after log review for false positives.

## 3) Immediate Verification (10 minutes)

1. Manual unauthorized cron probe:
- Request: `GET /api/cron/monthly-subscription` without auth header
- Expected: `401`
- Expected log: `[cron/monthly-subscription] unauthorized` with `trigger: 'manual-or-other'`

2. Suspicious path probe:
- Request: `GET /api/.env`
- Expected: `404` and header `X-API-Protection: suspicious-path`
- Expected log: `[api-protection] blocked` with `reason: 'suspicious_path'`

3. Burst probe (`/api/analysis/annual` repeated):
- Expected: `429` after threshold
- Expected log: `[api-protection] blocked` with `reason: 'rate_limit'`

## 4) 24h Monitoring Evidence

Use `WAF_24H_EVIDENCE_TEMPLATE.md` and collect:

1. Vercel Firewall rule hit counts
2. Function logs for blocked requests
3. False positive count
4. Any user-facing incident count
5. Cron scheduled run status (`200` and runtime/memory)

## 5) Tuning and Rollback

1. If false positives > 0, relax thresholds first.
2. If bot traffic still high, tighten `/api/*` then `/api/cron/*`.
3. Keep one-click rollback:
- disable newest WAF rule first
- keep middleware protection enabled

## 6) Runtime Flags

- `API_RATE_LIMIT_WINDOW_MS` default `60000`
- `API_RATE_LIMIT_MAX` default `60`
- `CRON_RATE_LIMIT_MAX` default `10`
- `SECURITY_LOG_BLOCKED_REQUESTS` default `true`

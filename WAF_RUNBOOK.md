# Vercel WAF Runbook

This project already blocks suspicious API paths and rate-limits `/api/*` in middleware.
Use this runbook to add dashboard-level WAF rules in Vercel.

## 1) Rule Set (Recommended)

Apply these rules to production:

1. Block common exploit paths
- Path contains one of:
  - `/.env`
  - `/.git`
  - `wp-admin`
  - `wp-login`
  - `xmlrpc.php`
  - `phpmyadmin`
  - `.php`
  - `../`

2. Protect API from bursts
- Path starts with `/api/`
- Rate limit per IP (start conservative, then tune)
  - Example: `120 req / 1 min`

3. Protect cron endpoint harder
- Path starts with `/api/cron/`
- Rate limit per IP
  - Example: `20 req / 1 min`

4. Optional user-agent block list
- Block known scanner/bot UA signatures after observing logs for false positives.

## 2) Where to Check

1. Vercel Dashboard -> Project -> Firewall / WAF
2. Vercel Dashboard -> Project -> Logs (Function + Edge)
3. App logs for middleware blocks:
- `"[api-protection] blocked"` entries

## 3) Tuning Loop

1. Start with `monitor` or low-impact limits
2. Watch 24h logs for false positives
3. Tighten rules gradually
4. Keep emergency rollback rule ready

## 4) Runtime Flags

- `API_RATE_LIMIT_WINDOW_MS` (default `60000`)
- `API_RATE_LIMIT_MAX` (default `60`)
- `CRON_RATE_LIMIT_MAX` (default `10`)
- `SECURITY_LOG_BLOCKED_REQUESTS` (default `true`; set `false` to mute block logs)

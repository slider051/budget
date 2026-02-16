# WAF 24h Evidence Template

Use this after applying Vercel Firewall/WAF rules.

## Metadata

- Date range (KST): `YYYY-MM-DD HH:mm` ~ `YYYY-MM-DD HH:mm`
- Project environment: `production`
- Operator:

## Applied Rules

1. Suspicious path block
- Rule ID / name:
- Action: `block`

2. API burst protection (`/api/*`)
- Rule ID / name:
- Threshold:
- Window:

3. Cron path protection (`/api/cron/*`)
- Rule ID / name:
- Threshold:
- Window:

## 24h Monitoring Summary

- Total blocked requests:
- Blocked by suspicious path:
- Blocked by rate limit:
- False positives:
- User-impact incidents:

## Required Log Evidence

1. Vercel Function logs
- `"[api-protection] blocked"` entries screenshot or export:

2. Vercel Firewall logs
- Rule hit counts screenshot or export:

3. Cron endpoint status
- Scheduled run response status + runtime metrics:

4. Manual unauthorized probe
- `GET /api/cron/monthly-subscription` without auth -> `401` log evidence:

## Decision

- PASS / HOLD / FAIL
- Follow-up actions:

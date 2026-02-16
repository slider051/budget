# PASS Evidence Template

Use this template when promoting to the next MVP stage.

## Metadata

- Date:
- Commit:
- Environment: local / preview / production
- Operator:

## Automated Checks

1. `npm run lint`
- Result:
- Evidence link or screenshot:

2. `npm run test:all`
- Result:
- Evidence link or screenshot:

3. `npm run build`
- Result:
- Evidence link or screenshot:

4. `npm run gate:regression`
- Result:
- Generated report path:

## Functional Checks

1. Cron run (`/api/cron/monthly-subscription`)
- Trigger type (`vercel-cron` or manual):
- Response status/body:
- Log evidence:

2. Analysis API (`/api/analysis/annual?year=YYYY`)
- Source (`rpc` or `raw-fallback`):
- Response summary:
- Log evidence:

3. Backup/restore flow
- Export file count:
- Import mode tested:
- Result:

## SQL / Migration Evidence

- Applied migration files:
- Rollback verification:
- Query result evidence:

## Final Decision

- PASS / HOLD / FAIL
- Notes:

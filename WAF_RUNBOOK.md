# Vercel WAF 운영 가이드

이 프로젝트는 앱 레벨에서 이미 아래 보호가 동작합니다.
- 비정상 API 경로 필터
- `/api/*`, `/api/cron/*` 레이트리밋

이 문서는 Vercel 대시보드 WAF를 추가하고 24시간 증빙까지 남기기 위한 절차입니다.

## 1) 사전 확인

Vercel Production 환경변수에 아래 4개를 등록(또는 값 확인)합니다.
- `API_RATE_LIMIT_WINDOW_MS=60000`
- `API_RATE_LIMIT_MAX=60`
- `CRON_RATE_LIMIT_MAX=10`
- `SECURITY_LOG_BLOCKED_REQUESTS=true`

의미:
- `API_RATE_LIMIT_WINDOW_MS`: 레이트리밋 시간창(ms)
- `API_RATE_LIMIT_MAX`: `/api/*` 허용 요청 수
- `CRON_RATE_LIMIT_MAX`: `/api/cron/*` 허용 요청 수
- `SECURITY_LOG_BLOCKED_REQUESTS`: 차단 로그 출력 여부

## 2) WAF 룰 적용(플랜 제한 반영)

위치:
- `Vercel Dashboard -> Project -> Firewall`

권장 룰:
1. `block-suspicious-paths`
- 조건: path에 아래 중 하나 포함
- `/.env`, `/.git`, `wp-admin`, `wp-login`, `xmlrpc.php`, `phpmyadmin`, `.php`, `../`
- 동작: `Block`

2. `rate-limit-api`
- 조건: path starts with `/api/`
- 동작: `Rate limit`
- 시작값: `120 req / 1 min / IP`

중요:
- Vercel에서 rate-limit 룰이 1개만 가능하면 `rate-limit-api`만 두고 운영합니다.
- `/api/cron/*`는 앱 내부 `CRON_RATE_LIMIT_MAX`가 추가 방어를 수행하므로 안전하게 보완됩니다.

## 3) 즉시 검증(10분)

1. Cron 무인증 호출 확인
- 요청: 인증 헤더 없이 `GET /api/cron/monthly-subscription`
- 기대값: `401`
- 로그: `[cron/monthly-subscription] unauthorized`, `trigger: 'manual-or-other'`

2. 비정상 경로 차단 확인
- 요청: `GET /api/.env`
- 기대값: `404`, 헤더 `X-API-Protection: suspicious-path`
- 로그: `[api-protection] blocked`, `reason: 'suspicious_path'`

3. 버스트 제한 확인
- 요청: `/api/analysis/annual` 반복 호출
- 기대값: 임계 초과 시 `429`
- 로그: `[api-protection] blocked`, `reason: 'rate_limit'`

## 4) 24시간 증빙

`WAF_24H_EVIDENCE_TEMPLATE.md`에 아래를 기록합니다.
- Vercel Firewall rule hit 수
- Function 로그 차단 건수
- 오탐(false positive) 건수
- 사용자 영향 여부
- cron 스케줄 실행 상태(`200`, 메모리/실행시간)

## 5) 튜닝/롤백

1. 오탐이 있으면 임계값부터 완화
2. 봇 트래픽이 계속 높으면 `/api/*` 임계값 점진 강화
3. 문제 시 최신 WAF 룰부터 비활성화하고 앱 레벨 보호는 유지

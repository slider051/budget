# Budget Tracker MVP

간단한 예산 관리 웹 애플리케이션

## 프로젝트 요약

- **기술 스택**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Zod, React Context
- **페이지**: 대시보드(`/`), 예산(`/budget`), 거래내역(`/transactions`), 구독관리(`/subscriptions`), 연간분석(`/analysis`), 설정(`/settings`)
- **핵심 기능**: 
  - 수입/지출 입력 및 카테고리별 분석
  - 고급 필터링 (검색어, 날짜, 금액 범위, 카테고리, 정렬)
  - 예산 설정 및 90% 초과 알림
  - 데이터 백업/복원 (JSON)
  - 구독관리 (진행 중)
  - 다크모드 (system/light/dark)
- **데이터 저장**: Supabase (`transactions`, `monthly_budgets`, `subscriptions`) + localStorage(테마/프리셋 UI 설정만)
- **아키텍처**: 불변성 보장, Server Components 기본, Context+Reducer 상태관리

## 실행 방법

```bash
npm install
npm run dev       # 개발 서버: http://localhost:3000
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run lint:fix  # ESLint 자동 수정
npm run test:kst  # KST 월 경계 단위 테스트
npm run test:analysis # 연간 분석 집계 단위 테스트
npm run test:ops-alert # 운영 알림 웹훅 단위 테스트
```

## 운영 보안 환경변수

- `CRON_SECRET` (필수): `/api/cron/*` 호출 인증 토큰
- `API_RATE_LIMIT_WINDOW_MS` (선택, 기본 `60000`): `/api/*` 레이트리밋 윈도우(ms)
- `API_RATE_LIMIT_MAX` (선택, 기본 `60`): `/api/*` 윈도우당 허용 요청 수
- `CRON_RATE_LIMIT_MAX` (선택, 기본 `10`): `/api/cron/*` 윈도우당 허용 요청 수
- `SECURITY_LOG_BLOCKED_REQUESTS` (선택, 기본 `true`): 차단 요청(rate/suspicious path) 로그 출력 여부
- `OPS_ALERT_WEBHOOK_URL` (선택): 운영 알림 웹훅 URL (예: Slack Incoming Webhook)
- `OPS_ALERT_WEBHOOK_URL_CRITICAL` (선택): `critical` 전용 웹훅 URL
- `OPS_ALERT_WEBHOOK_URL_ERROR` (선택): `error` 전용 웹훅 URL
- `OPS_ALERT_WEBHOOK_URL_WARN` (선택): `warn` 전용 웹훅 URL
- WAF 운영 가이드: `WAF_RUNBOOK.md`

## Supabase SQL 적용(분석 RPC 2차)

- 적용 파일: `supabase/migrations/20260215_analysis_payload_rpc.sql`
- 롤백 파일: `supabase/migrations/20260215_analysis_payload_rpc_rollback.sql`
- 적용 후 확인: `/api/analysis/annual?year=2026` 응답에서 `source`가 `rpc`인지 확인

## Cron 운영 로그 확인 포인트

- 경로: `/api/cron/monthly-subscription`
- 응답 필드: `ok`, `yearMonth`, `users`, `created`, `skipped`, `total`, `trigger`, `requestId`
- 로그 이벤트:
  - `[cron/monthly-subscription] started`
  - `[cron/monthly-subscription] completed`
  - `[cron/monthly-subscription] failed`

## 최근 추가된 기능

### 거래내역 필터링 (IME 안정화)
- 한글 입력 중복/사라짐 해결 (composition event 처리)
- 금액 입력 안정화 (onBlur 시점 URL 반영)
- 기본 기간 필터 (yearStart ~ today, 성능 최적화)
- "2026년 전체" 버튼으로 연간 데이터 조회

### 예산 관리
- 카테고리별 예산 설정
- 90% 초과 시 알림 표시
- 알림 해제 상태는 세션 중 메모리 상태로 관리

### 데이터 관리
- 백업 다운로드 (JSON)
- 복원 (Replace/Merge 모드)
- 알림 초기화

### 구독관리 (진행 중)
- 기본 서비스 프리셋 (OTT, AI, 쇼핑, 음악, 독서)
- 결제 가격 중심 UI, 사용자 수 분담 계산, 할인율 자동 계산
- 통화 선택 (KRW/USD/JPY), 결제주기 (월/연간/그외 월 수), 다음 결제일 계산
- 메모 보기 토글, 종료일 기준 결제일 표시 규칙 반영
- 1인 결제가격 강조 카드 + 할인율 강조 박스 + 결제일/종료일 배지 UI
- 유지보수를 위한 컴포넌트 분리 (Page/Form/Card/State 모듈화)

### 대시보드 프리셋 (신규)
- 대시보드 배너에서 직업 프리셋(학생/직장인) 원클릭 적용
- 적용 내용: 월 수입 샘플 거래 1건 + 이번 달 카테고리 예산 + 기본 구독 샘플
- 샘플 원본 데이터 위치: `src/lib/presets/dashboardPresets.ts`

## 아직 구현되지 않은 것

- 차트/그래프 시각화 (월별 트렌드, 카테고리 파이 차트)
- 고정 지출 자동 생성 (매월 자동 입력)
- 예산 템플릿 저장/불러오기
- CSV/Excel 내보내기
- 구독관리 기능 고도화 (진행 중)

## Regression Gate

Use the commands below for release gating and evidence capture.

```bash
npm run test:api
npm run test:security
npm run test:all
npm run gate:regression
```

- `npm run gate:regression` runs `audit:ui-lines -> lint -> test:all -> build`.
- A markdown evidence report is generated under `reports/pass-evidence/`.
- Manual checklist template: `PASS_EVIDENCE_TEMPLATE.md`.
- WAF operation guides:
  - `WAF_RUNBOOK.md`
  - `WAF_24H_EVIDENCE_TEMPLATE.md`

## UI Docs

- UI card/layout policy: `docs/ui/UI_CARD_POLICY.md`
- UI rewrite plan: `docs/ui/UI_REWRITE_PLAN.md`

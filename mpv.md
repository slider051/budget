# MVP 로드맵

## MVP 0 상태 (2026-02-14)
- 상태: 완료
- 완료 범위:
  1. Google OAuth 로그인/로그아웃
  2. 인증 기반 라우트 보호
  3. `transactions`, `monthly_budgets`, `subscriptions` Supabase 저장
  4. `user_id` + RLS 정책 적용
  5. Vercel 배포 + 환경변수 연결

## MVP 1 필승을 위한 핵심 체크리스트 Top 10
타협은 없다. 아래 10개를 통과하지 못하면 프로덕션 승급 금지.

### 데이터 무결성 & 보안
1. RLS 철벽 방어
- `subscriptions` RLS가 완전 적용되어, API 직접 호출로도 타 유저 데이터 접근 불가.

2. 배치 멱등성(Idempotency)
- 자동 생성 배치가 연속 재실행되어도 월별 고정 지출은 정확히 1회만 생성.
- `UNIQUE(user_id, subscription_id, year_month)` 등 유니크 제약 필수.

3. 쓰레기 데이터 차단
- 음수 금액, 잘못된 날짜, 잘못된 billing_cycle 조합을 DB Check Constraint에서 차단.

### 성능 & 아키텍처
4. 잔재 완전 소각
- localStorage fallback/중복 저장 경로 제거.
- 캐시 목적 외 localStorage write 금지.

5. N+1 쿼리 폭격 방지
- 분석 차트는 단일 집계 쿼리(조인/뷰/materialized view) 중심으로 구성.

6. 비동기 상태 관리
- 로딩/오류/재시도/낙관적 업데이트가 UI에 명확히 반영.

### 자동화 & 운영
7. 크론 신뢰성
- Vercel Cron 또는 Supabase Edge Function 트리거가 정시 1회 실행됨을 테스트에서 검증.

8. 실시간 알림(Alerting)
- 배치 실패/DB 타임아웃을 콘솔에서 끝내지 않고 Slack/Discord/문자/푸시로 즉시 알림.

### 사용자 경험 & 배포
9. 트랜잭션 안전성
- 수정 중 네트워크 실패 시 반쪽 저장 없이 원자성 보장(롤백 또는 보상 처리).

10. 무중단 회귀 테스트
- MVP 1 배포 시 기존 MVP 0 사용자 세션 유지 + 핵심 기능 회귀 통과.

## 현재 갭 점검 (2026-02-14)
- [부분 충족] 1번 RLS: 테이블 정책은 적용됨. API 경계/권한 테스트 자동화는 부족.
- [충족] 2번 멱등성: RPC + 5회 재실행 + 중복 0행 확인 완료.
- [부분 충족] 3번 DB 검증: 주요 제약은 보강됨. 서버 입력 검증/에러 매핑 보강 필요.
- [미충족] 4번 localStorage 제거: `backupRepository`, `storage.ts`, `alerts` 등 잔재 존재.
- [미충족] 5번 단일 집계 쿼리: 분석은 클라이언트 계산 위주.
- [부분 충족] 6번 비동기 UX: subscriptions는 반영됨, 전 영역 통일 필요.
- [미충족] 7번 크론 검증: Cron 경로 미구현.
- [미충족] 8번 실시간 알림: 콘솔 로그 중심.
- [부분 충족] 9번 트랜잭션 안전성: 일부 비동기 처리만 있음, 원자적 서버 처리 부족.
- [부분 충족] 10번 무중단 회귀: 수동 확인 수준, 자동 회귀 테스트 부족.

## MVP 1.5 완료 체크리스트 (<=10)
1. [x] `subscriptions` 제약/인덱스 적용
- SQL 마이그레이션 + 롤백 스크립트 쌍으로 관리.

2. [x] `generated_charges`(또는 `runs`) 테이블 생성
- `UNIQUE(user_id, subscription_id, year_month)` 적용.
- 월 조회/실행 이력 조회용 인덱스 추가.

3. [x] `transactions` 중복 방지 최종 방어
- 자동 생성 거래에 `generation_key`(또는 `subscription_id + year_month`) 컬럼 추가.
- DB 유니크 제약으로 중복 삽입 차단.

4. [x] 멱등 배치 함수(RPC) 구현
- 재실행 5회 테스트에서 upsert/no-op 보장.
- 실패 시 재시도해도 결과 동일해야 함.

5. [ ] 배치 실행 경로/시간 기준 확정
- 권장 경로: `Vercel Cron -> API Route -> Supabase RPC`.
- `Asia/Seoul` 기준 월 경계(말일 23:59~익월 00:01) 테스트 통과.

6. [x] localStorage fallback 제거
- 허용 목록: 테마/UI 설정만 유지.
- 그 외 사용 금지 영역은 lint 규칙으로 강제.

7. [ ] 분석 집계 서버화
- [x] 1차: `/api/analysis/annual` 서버 집계 API 전환(연간 KPI/월별/카테고리 합계)
- [x] 2차 코드: RPC 함수/인덱스 SQL + API `rpc 우선 -> fallback` 경로 구현
- [x] 2차 운영: Supabase migration 적용 + RPC source 실운영 확인

8. [ ] 서버 입력 검증 통합
- Zod 검증 + DB 제약 이중 방어.
- 에러 메시지는 사용자용/로그용 분리 매핑.

9. [ ] Slack 알림 연결
- [x] 1차: Cron 실패 시 webhook 알림 전송(`OPS_ALERT_WEBHOOK_URL`)
- 실패/지연/중복탐지 이벤트 알림.
- severity 기준(critical/error/warn)과 라우팅 채널 정의.

10. [ ] 회귀 테스트 자동화 + 배포 게이트
- 로그인/세션/CRUD/배치/분석 시나리오 자동화.
- `PASS 증빙 템플릿`(테스트 로그, SQL 링크, 스크린샷)으로 승급 판단.

## 진행 현황 (2026-02-15)
- 완료:
  1. Phase 1 SQL 적용(`subscriptions` 제약/인덱스, `generated_charges`, `transactions.generation_key`)
  2. Phase 2 RPC 적용(`run_monthly_subscription_generation`)
  3. 멱등성 검증 통과(동일 월 5회 실행 결과 `created=0, skipped=3, total=3`)
  4. 중복 최종 검증 통과(`generation_key` 중복 조회 0행)
  5. 봇 대응 1차 적용(`/api/*` 레이트리밋 + 비정상 경로 시그니처 필터)
  6. `Asia/Seoul` 월 경계 단위 테스트 추가(`test:kst`)
  7. Phase 3 1차 완료(localStorage 데이터 fallback 제거 + lint 차단)
  8. 분석 집계 1차 서버화(`/analysis -> /api/analysis/annual`)
  9. 분석 집계 2차 코드 완료(RPC SQL + fallback-safe API)
  10. WAF 운영 준비 완료(차단 로그 강화 + `WAF_RUNBOOK.md`)
  11. Cron API 구조 로그 강화(`trigger/requestId/start/completed/failed`)
  12. 분석 집계 2차 운영 확인 완료(`source=rpc`)
  13. Slack 알림 1차 연결(Cron 실패 -> webhook)
- 다음 작업:
  1. `Vercel Cron -> API -> RPC` 연결
  2. Vercel Cron 자동 실행 로그 확인
  3. Vercel WAF 룰셋(대시보드) 실제 적용 및 24시간 튜닝
  4. Slack 채널 severity/route 분기(critical/error/warn) 확장

## MVP 1.5 실행 플랜

### Phase 1: DB 방어선
1. [x] `subscriptions` 마이그레이션/롤백 스크립트 정리
2. [x] `generated_charges` 테이블 + 유니크/인덱스 추가
3. [x] `transactions.generation_key` 추가 + 유니크 제약 적용

### Phase 2: 배치 멱등성
4. [x] Supabase RPC(월 자동 생성) 구현
5. [ ] Cron API 라우트 연결 + `Asia/Seoul` 경계 테스트

### Phase 3: 아키텍처/성능
6. [x] localStorage fallback 제거 + lint 금지 규칙
7. [ ] 분석 집계 View/RPC 서버화 + RLS/인덱스 검증
- 1차: `/api/analysis/annual` 서버 집계 API 적용 완료
- 2차 코드: `supabase/migrations/20260215_analysis_payload_rpc.sql` 추가 완료

### Phase 4: 운영/게이트
8. [ ] Zod + DB 제약 에러 매핑 정리
9. [ ] Slack 알림(severity/route) 연결
10. [ ] 회귀 자동화 + PASS 증빙 템플릿 운영

## MVP 1.5 Definition of Done
1. Top 10 항목 전부 PASS 증빙(테스트 로그/스크린샷/SQL 링크).
2. 배치 멱등성 검증 완료(동일 월 5회 재실행 테스트 PASS).
3. localStorage fallback 제거 완료(허용 목록 외 lint 차단).
4. 알림 채널 실운영 연결 완료.
5. 린트/빌드/회귀 테스트 통과 + PASS 증빙 템플릿 첨부 후 배포.

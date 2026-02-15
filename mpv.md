# MVP 1.5

## MVP 1.5 체크리스트 (<=10)
1. [x] `subscriptions` 제약/인덱스 적용
- SQL 마이그레이션 + 롤백 스크립트 관리

2. [x] `generated_charges`(또는 `runs`) 테이블 생성
- `UNIQUE(user_id, subscription_id, year_month)` 적용
- 월 조회/실행 이력용 인덱스 추가

3. [x] `transactions` 중복 방지 최종 방어
- 자동 생성 거래에 `generation_key` 추가
- DB 유니크 제약으로 중복 삽입 차단

4. [x] 멱등 배치 함수(RPC) 구현
- 동일 월 재실행(no-op/upsert) 보장

5. [ ] 배치 실행 경로/시간 기준 최종 확정
- `Vercel Cron -> API Route -> Supabase RPC`
- `Asia/Seoul` 기준 월 경계 자동 실행 로그 최종 확인 필요

6. [x] localStorage fallback 제거
- 데이터 저장은 DB 기준, UI 설정만 localStorage 허용

7. [x] 분석 집계 서버화
- `/api/analysis/annual` 서버 집계 API 적용
- RPC 우선 + fallback 경로 구현 및 운영 확인

8. [x] 서버 입력 검증 통합
- Zod 검증 + DB 제약 이중 방어
- 에러 메시지 사용자용/로그용 분리 매핑

9. [x] Slack/Discord 알림 연결
- Cron 실패 webhook 알림 전송 적용
- severity(`critical/error/warn`) 라우팅 지원

10. [x] 회귀 테스트 자동화 + 배포 게이트
- `npm run test:all`, `npm run gate:regression`
- PASS 증빙 템플릿 운영

## MVP 1.5 상태 (완료 요약용)
- 진행률: **9/10 (90%)**
- 완료: 1, 2, 3, 4, 6, 7, 8, 9, 10
- 남음: 5 (Vercel Cron 자동 실행 로그 최종 증빙)
- 운영 메모: 알림 채널 2~3분리는 일일 에러 `10건 이상` 누적 시 적용

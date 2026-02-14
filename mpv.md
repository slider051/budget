# MVP 로드맵

## MVP 0 상태 (2026-02-14)
- 상태: 완료
- 완료 범위:
  1. Google OAuth 로그인/로그아웃
  2. 인증 기반 라우트 보호
  3. `transactions`, `monthly_budgets` Supabase 저장
  4. `user_id` + RLS 정책 적용
  5. Vercel 배포 + 환경변수 연결
- 배포 후 확인 결과:
  1. 로그인 정상
  2. Supabase 테이블 저장 정상

## MVP 1 목표
- 운영 안정화 + 핵심 기능 2차 완성
- localStorage 의존 제거 및 데이터 신뢰성 강화
- 구독 기능(`subscriptions`)까지 DB 이관

## MVP 1 범위 (IN)
1. `subscriptions` Supabase 마이그레이션
2. 백업/복원 기능을 Supabase 데이터 기준으로 재검증
3. 고정지출 자동 생성 배치(월 단위) 1차 도입
4. 차트/분석 핵심 2종 추가 (월별 트렌드, 카테고리 비중)
5. 운영 안전장치 추가 (에러 로깅, 입력 검증 강화)

## MVP 1 범위 (OUT)
1. 팀 협업/공유 가계부
2. 결제/유료 플랜
3. 복잡한 통계 예측 기능

## MVP 1 작업 순서
1. 데이터 계층 정리
   - `subscriptions` 테이블 스키마 확정 + 인덱스 설계
   - `user_id default auth.uid()` 적용
   - `subscriptions` RLS 정책(본인 데이터만 SELECT/INSERT/UPDATE/DELETE)
   - 기존 repository 패턴과 동일한 Supabase repository 작성
   - 타입/DTO 정리
2. 기능 이관
   - 구독 CRUD를 DB 기반으로 전환
   - 기존 localStorage fallback 제거
   - 백업/복원 export/import 흐름 재검증(거래/예산/구독 전체)
3. 자동화 기능
   - 고정지출 월 자동 생성 로직 추가
   - 중복 생성 방지 키 설계(예: `user_id + subscription_id + year_month` 유니크)
   - 월 단위 배치 실행 경로 결정(크론/서버 액션/Edge Function)
   - 실패/재시도 최소 처리
4. 분석 고도화
   - 월별 지출/수입 추이 차트
   - 카테고리 지출 비중 차트
   - 분석 쿼리/집계 성능 인덱스 점검
5. 품질/운영
   - 서버측 입력 검증 추가
   - 에러 로깅 포인트 정의(로그인/CRUD/배치/차트)
   - 프로덕션 시나리오 회귀 테스트 + 린트/빌드/배포

## MVP 1 상세 체크리스트
1. `subscriptions` 스키마/인덱스 확정 + `user_id default auth.uid()` 적용
2. `subscriptions` RLS 정책(본인 데이터만 SELECT/INSERT/UPDATE/DELETE)
3. Supabase Repository + 타입/DTO 정리
4. 구독 CRUD DB 전환 + localStorage fallback 제거
5. 백업/복원(Supabase 단일 소스: 거래/예산/구독) 재검증
6. 고정지출 자동 생성 중복 방지 키(`user_id + subscription_id + year_month`) 확정
7. 월 배치 실행 경로(크론/서버 액션/Edge Function) + 실패/재시도 처리
8. 분석 2종 쿼리/집계 + 성능 인덱스 점검
9. 서버측 입력 검증 + 에러 로깅 포인트(로그인/CRUD/배치/차트)
10. 프로덕션 회귀 테스트 + 린트/빌드/배포 완료

## MVP 1 Definition of Done
1. `transactions`, `monthly_budgets`, `subscriptions` 모두 Supabase 단일 소스화
2. 모든 사용자 데이터 접근이 RLS로 격리됨
3. 프로덕션에서 다음 시나리오 통과
   - 로그인
   - 거래 CRUD
   - 예산 CRUD
   - 구독 CRUD
   - 분석 페이지 로드
4. 린트/빌드 통과 + 배포 완료

## 권장 일정 (빠른 진행)
1. Day 1: subscriptions DB 설계 + CRUD 이관
2. Day 2: 고정지출 자동화 + 회귀 테스트
3. Day 3: 차트 2종 + 운영 안정화 + 배포

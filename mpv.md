# MVP 0 배포 플랜 (오늘)

## 목표
- Supabase로 유저 인증/가계부 데이터 관리
- Google OAuth 로그인 적용
- Vercel 배포 완료

## 범위 (IN)
1. Google 로그인/로그아웃
2. 로그인 필수 라우트 보호
3. `transactions`, `monthly_budgets` 테이블 생성
4. `user_id` 기반 RLS 정책 적용
5. 거래/예산 로컬스토리지 CRUD를 Supabase CRUD로 전환
6. Vercel 환경변수/리다이렉트 설정 및 프로덕션 검증

## 범위 (OUT)
1. `subscriptions` DB 마이그레이션
2. 백업/복원 고도화
3. 차트, CSV/Excel, 고정지출 자동화

## 작업 순서
1. Supabase 프로젝트 생성 및 Google Provider 활성화
2. SQL 실행
   - `transactions`, `monthly_budgets` 테이블
   - 인덱스 및 `updated_at` 기본값
   - RLS ON + `auth.uid() = user_id` 정책 (SELECT/INSERT/UPDATE/DELETE)
3. Next.js에 Supabase 클라이언트 추가
4. 인증 UI 구성 (로그인 버튼, 로그아웃 버튼, 세션 확인)
5. 앱 페이지 접근 제어(비로그인 시 로그인 페이지로 이동)
6. Repository 계층을 Supabase 기반으로 교체
   - `storage.ts`
   - `budgetRepository.ts`
7. `.env.local` 정리
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
8. Vercel 배포
   - 환경변수 등록
   - Supabase Auth Redirect URL 등록

## 완료 조건 (Definition of Done)
1. Google 로그인 성공 후 세션 유지
2. 거래/예산 생성/조회/수정/삭제가 DB에 반영
3. 다른 계정 데이터 접근 차단(RLS 검증)
4. 프로덕션 URL에서 동일 동작

## 보안 체크 (배포 전)
1. 시크릿/키 하드코딩 금지
2. RLS 없는 테이블 없음
3. 에러 응답에 내부정보/토큰 노출 없음
4. 로그에 민감정보 출력 없음

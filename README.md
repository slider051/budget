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
- **데이터 저장**: localStorage (SSR 안전, 추상화 인터페이스)
- **아키텍처**: 불변성 보장, Server Components 기본, Context+Reducer 상태관리

## 실행 방법

```bash
npm install
npm run dev       # 개발 서버: http://localhost:3000
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run lint:fix  # ESLint 자동 수정
```

## 최근 추가된 기능

### 거래내역 필터링 (IME 안정화)
- 한글 입력 중복/사라짐 해결 (composition event 처리)
- 금액 입력 안정화 (onBlur 시점 URL 반영)
- 기본 기간 필터 (yearStart ~ today, 성능 최적화)
- "2026년 전체" 버튼으로 연간 데이터 조회

### 예산 관리
- 카테고리별 예산 설정
- 90% 초과 시 알림 표시
- localStorage 기반 알림 해제 기록

### 데이터 관리
- 백업 다운로드 (JSON)
- 복원 (Replace/Merge 모드)
- 알림 초기화

### 구독관리 (진행 중)
- 기본 서비스 프리셋 (OTT, AI, 쇼핑, 음악, 독서)
- 결제 가격 중심 UI, 사용자 수 분담 계산, 할인율 자동 계산
- 통화 선택 (KRW/USD/JPY), 결제주기 (월/연간/그외 월 수), 다음 결제일 계산
- 메모 보기 토글, 종료일 기준 결제일 표시 규칙 반영

## 아직 구현되지 않은 것

- 차트/그래프 시각화 (월별 트렌드, 카테고리 파이 차트)
- 고정 지출 자동 생성 (매월 자동 입력)
- 예산 템플릿 저장/불러오기
- CSV/Excel 내보내기
- 구독관리 기능 고도화 (진행 중)

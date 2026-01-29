# Budget Tracker MVP

간단한 예산 관리 웹 애플리케이션

## 프로젝트 요약

- **기술 스택**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Zod, React Context
- **페이지**: 대시보드(`/`), 거래내역(`/transactions`)
- **핵심 기능**: 수입/지출 입력, 카테고리별 분석, 실시간 요약, 필터링
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

## 아직 구현되지 않은 것

- 날짜 범위 필터 (특정 기간 거래 조회)
- 데이터 백업/복원 (JSON 내보내기/가져오기)
- 차트/그래프 시각화 (라인 차트, 파이 차트)
- 예산 목표 설정 및 알림

## 수정해야 할 것

- TransactionForm 폼 초기화 시 카테고리 첫 번째 항목으로 자동 선택
- TransactionList limit prop이 있을 때 "더보기" 버튼 추가
- 다크모드 지원 (선택사항)

## 확인해야 할 것
- 필터 동작 확인 (유형/카테고리 조합)
- 반응형 레이아웃 확인 (모바일/태블릿/데스크톱)
- 카테고리별 지출 비율 계산 정확도 확인

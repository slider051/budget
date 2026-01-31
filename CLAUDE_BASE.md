# Next.js MVP Development Guide

.claude/rules와 .claude/skills를 기반으로 한 종합 개발 가이드입니다.

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router
├── components/       # React 컴포넌트  
├── hooks/           # Custom React hooks
├── lib/             # 유틸리티, 클라이언트
└── types/           # TypeScript 타입
```

## 핵심 원칙

### 1. 불변성 (CRITICAL)

항상 새 객체 생성, 절대 변경 금지:

```typescript
// ❌ 잘못됨
function updateUser(user, name) {
  user.name = name
  return user
}

// ✅ 올바름
function updateUser(user, name) {
  return { ...user, name }
}
```

## 보안 체크리스트

- [ ] API 키 하드코딩 금지
- [ ] 모든 입력 검증
- [ ] SQL 인젝션 방지
- [ ] XSS 방지

상세 내용은 .claude/rules와 .claude/skills를 참고하세요.

## 작업 흐름 (고정)

1) mgrep/파일 탐색으로 기존 구조 확인 (추측 금지)
2) 변경/생성할 파일 목록 제시
3) 구현 (TDD 원칙)
  - 테스트 먼저 작성 (가능한 경우)
  - 최소 코드로 구현
  - 불변성 유지 (절대 mutation 금지)
4) 확인 방법
  - `npm run lint` 통과
  - 보안 체크리스트 확인 (secrets, input validation)
  - 핵심 플로우 수동 체크
  

## Next.js 기본 규칙

- 기본은 Server Component. 필요할 때만 `use client`.
- 클라이언트에 노출되는 env는 `NEXT_PUBLIC_*`만 허용.
- 데이터 접근은 `src/lib` 레이어로 감싸고, UI는 레이어만 호출.

## 폴더/책임 분리

- UI: `src/components`
- Page/Route: `src/app`
- Business logic / API wrappers: `src/lib`
- Types: `src/types`
- State/Hooks: `src/hooks`

## 최소 품질 체크

- 변경 후 `npm run lint` 또는 `npm run typecheck` 중 최소 1개는 통과
- 핵심 화면 1개는 수동 체크(입력→저장→리스트 반영)

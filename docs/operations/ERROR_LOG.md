# Error Log

## 2026-02-12 - 다크모드 토글 시 화면 미반영

### 증상
- 설정 페이지에서 테마를 `dark`로 바꿔도 UI가 다크 스타일로 바뀌지 않음.
- `document.documentElement`에 `dark` 클래스가 붙어도 `dark:*` 유틸리티가 적용되지 않음.

### 원인
- Tailwind CSS v4 환경에서 `dark` 변형이 클래스 기반으로 재정의되지 않아,
  `dark:*`가 `@media (prefers-color-scheme: dark)` 기준으로 컴파일됨.
- 즉, 앱 코드가 `html.dark` 클래스를 토글해도 CSS가 그 조건을 보지 않아 화면 반영이 실패함.

### 확인 근거
- 클래스 토글 로직은 정상 동작:
  - `src/app/layout.tsx` (초기 스크립트에서 `dark` 클래스 추가)
  - `src/hooks/useTheme.ts` (`applyTheme`에서 `classList.add/remove`)
  - `src/components/ThemeClassApplier.tsx` (`classList.toggle`)
- 컴파일된 CSS 확인 결과, `dark:*`가 클래스 선택자가 아닌 미디어쿼리로 생성됨:
  - `.next/dev/static/chunks/src_app_globals_91e4631d.css`
  - `@media (prefers-color-scheme: dark)` 블록으로 생성된 `dark:*` 유틸 확인

### 해결
- 파일: `src/app/globals.css`
- 아래 설정을 추가해 Tailwind v4의 `dark` variant를 클래스 기반으로 지정:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

### 결과
- `html.dark` 클래스 토글 시 `dark:*` 스타일이 즉시 반영됨.
- `npm run lint` 통과 확인.

### 재발 방지 체크리스트
- Tailwind 메이저 버전 업그레이드(v3 -> v4) 시 다크모드 variant 전략(class/media) 재검증.
- 테마 기능 구현 시 아래 2가지를 동시에 확인:
  1. DOM 클래스 토글 여부 (`html.dark`)
  2. 빌드된 CSS가 해당 클래스 기반으로 컴파일되는지

# UI System Guide

Last updated: 2026-02-16  
Scope: Dashboard, Budget, Transactions, Subscriptions, Analysis, Settings

## Goal
- Keep card sections visually stable when the browser width changes.
- Prevent "card blocks stretching and shrinking" across desktop pages.
- Keep card density and spacing consistent across all page types.

## Fixed Width Policy

### 1) Fixed page rail
- Main app content uses a fixed rail on desktop/tablet.
- Class: `page-rail-fixed`
- Token: `--page-rail-fixed-width: 1024px`
- Behavior:
  - `>= 640px`: fixed width rail (does not resize with viewport)
  - `< 640px`: fallback to `width: 100%`

### 2) Fixed section widths
- Narrow card stacks: `section-stack-fixed`
- Wide card stacks: `section-stack-wide`
- Tokens:
  - `--section-fixed-width: 768px`
  - `--section-wide-fixed-width: 1008px`
- Behavior:
  - `>= 640px`: fixed width
  - `< 640px`: fallback to `width: 100%`

### 3) Horizontal overflow handling
- Main content area must allow horizontal scroll when fixed widths exceed viewport.
- Use `overflow-x-auto` on the page main container.
- This preserves fixed card sizes instead of shrinking cards.

## Card Grid Policy
- Keep glance cards on controlled tracks (`card-grid-glance-4`).
- Avoid ad-hoc `flex-wrap + arbitrary width` combinations.
- Use compact spacing by default:
  - Card padding: `p-3` to `p-4`
  - Title: `text-sm` to `text-base`
  - Body: `text-xs` to `text-sm`

## Rewrite Rule (200+ lines)
- If a UI file exceeds 200 lines, prefer rewrite over incremental patching.
- Split orchestration and visual sections into smaller components.
- Audit command: `npm run audit:ui-lines`

## Implementation Checklist
- Browser resize does not resize desktop card sections.
- Fixed rail and fixed section classes are applied consistently.
- Small mobile screens still render with `width: 100%`.
- `lint`, `build`, and UI-related tests pass.

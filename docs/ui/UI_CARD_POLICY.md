# UI Card Layout Policy

Last updated: 2026-02-16

## Goal
- Keep card-based screens readable at a glance.
- Prevent cards from stretching unpredictably as viewport width changes.
- Keep visual density and hierarchy consistent across pages.
- Prefer rewrite over incremental patching for oversized UI pages/components.

## Core Rules
1. Use predefined card grid patterns, not ad-hoc `flex-wrap + width` mixes.
2. On desktop glance views (summary/action cards), use fixed track widths.
3. Use responsive column count only at breakpoints:
- mobile: 1 column
- tablet: 2 columns
- desktop glance: fixed 4 columns (no stretch)
4. Card internals should use compact spacing by default:
- title: `text-sm` or `text-base`
- body: `text-xs` or `text-sm`
- card padding: `p-3` to `p-4`
5. Avoid "full-width stretch cards" unless the section is intentionally hero/banner type.
6. `200+ lines rule`: do not incrementally patch large UI pages/components.
- Delete and rewrite to match policy.
- Split into smaller blocks during rewrite.
- Keep each presentational block small and composable.

## Recommended Sizes
- Glance card width (desktop fixed): `240px`
- Glance card min height: `168px`
- Card gap: `16px`

## Implementation Contract
- Use `card-grid-glance-4` for 4-card dashboard/action groups.
- Use `card-glance-item` on each card inside that grid.
- Use page-level max width container (`max-w-*`) to keep cross-page consistency.

## PR Checklist (Card Changes)
1. Does the card keep width stable on desktop resize?
2. Does it collapse only at defined breakpoints?
3. Are typography and spacing within compact range?
4. Is the card still readable without scrolling on common laptop heights?
5. If touched file is 200+ lines, was it rewritten (not patched)?

## Rewrite Workflow
1. Audit line counts first.
2. Mark 200+ line files as rewrite targets.
3. Define layout/token policy before code.
4. Replace large file with new implementation aligned to policy.
5. Verify with lint/build and visual check.

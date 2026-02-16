# UI Rewrite Plan

Last updated: 2026-02-16

## Principle
- For UI files over 200 lines, avoid incremental patching.
- Replace by rewrite aligned with `docs/ui/UI_CARD_POLICY.md`.

## Current 200+ Line Targets
None (verified by `npm run audit:ui-lines`).

## Rewrite Order (Recommended)
Use the same sequence when new 200+ files appear:
1. Split page-level orchestration.
2. Extract form/filter sections.
3. Keep each file under 200 lines.

## Completed
1. `src/app/[locale]/subscriptions/page.tsx`
- rewritten and split into:
  - `src/components/subscriptions/useSubscriptionEditor.ts`
  - `src/components/subscriptions/subscriptionEditorUtils.ts`
2. `src/components/subscriptions/SubscriptionForm.tsx`
- rewritten and split into:
  - `src/components/subscriptions/SubscriptionFormSections.tsx`
3. `src/app/[locale]/settings/page.tsx`
- deleted and rewritten under 200 lines
4. `src/components/transactions/TransactionFilterBar.tsx`
- deleted and rewritten under 200 lines
5. `src/components/budget/BudgetEditModal.tsx`
- deleted and rewritten under 200 lines

## Rewrite Template
1. Keep layout shell + data mapping in page-level file.
2. Move UI sections into small components.
3. Keep component line count under 200 where possible.
4. Use compact spacing and fixed card-grid policy for glance sections.
5. Avoid mixing `flex-wrap + arbitrary width` for card groups.

## Definition of Done
1. Lint passes.
2. Build passes.
3. Visual card width behavior stays stable on resize.
4. File size reduced and responsibilities clearly split.

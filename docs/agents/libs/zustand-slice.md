---
title: Zustand Slice Pattern
scope: src/domain/*/store/**, src/shared/store/**
applies_to: declaring or modifying a Zustand slice / store action
related:
  - ../structure.md
  - ../conventions/react-sections.md
---

# Zustand Slice Pattern

> 각 도메인은 `SlicePattern<DomainState, BoundState>` 슬라이스를 노출하고 `rootStore.ts` 에서 합친다. action 이름은 `domain/actionName`. `immer` middleware 활성화.

- Each domain exposes a slice using `SlicePattern<DomainState, BoundState>`. The `SlicePattern` type is provided by a module augmentation in `src/shared/store/index.ts` (imported as if from `zustand`).
- Slices are combined in `src/shared/store/rootStore.ts`; the union of all slice state types is `BoundState`.
- Action names follow `domain/actionName` for the devtools `type` field (example: `users/updateShowAddUserModal`).
- `immer` middleware is enabled. Inside `set`, either return a new object literally or rely on immer's draft mutation — do not mix the two styles in the same slice.

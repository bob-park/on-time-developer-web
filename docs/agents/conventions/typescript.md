---
title: TypeScript
scope: src/**/*.{ts,tsx}
applies_to: type declarations, component props, DTOs
related:
  - ./naming.md
  - ../libs/ky-react-query.md
---

# TypeScript

> `strict: true`. 확장 가능한 객체는 `interface`, union / mapped / DTO 는 `type`. props 는 `Readonly<{...}>`.

- `strict: true` is enabled. Assume non-null and exhaustive checks.
- Use `interface` for object shapes that may be extended.
- Use `type` for unions, mapped types, and DTOs.
- Component props are wrapped in `Readonly<{...}>`.

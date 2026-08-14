---
title: Tailwind 4 + daisyUI 5
scope: src/**/*.{tsx,css}
applies_to: styling components, theme handling
related:
  - ../conventions/react-sections.md
---

# Tailwind 4 + daisyUI 5

> 조건부 class 는 `classnames` (`import cx from 'classnames'`). daisyUI 토큰 (`btn`, `badge`, `menu`, `dropdown`, `modal`) 을 raw Tailwind 보다 우선. 테마는 cookie 기반 `data-theme`.

- Compose class names with `classnames` (`import cx from 'classnames'`). Do not hand-concatenate template strings for conditional classes.
- Prefer daisyUI components/tokens (`btn`, `badge`, `menu`, `dropdown`, `modal`, ...) before reaching for raw Tailwind primitives.
- Theme is cookie-driven via `data-theme` on `<html>`. See `src/shared/providers/theme/ThemeProvider.tsx`.

---
title: Tech Stack
scope: package.json
applies_to: dependency selection, version bumps
related:
  - ./overview.md
  - ./workflows/dev-env.md
---

# Tech Stack

> TypeScript 6 + Next.js 16 (App Router) + React 19. TanStack Query + Zustand + ky + next-intl v4. Tailwind 4 + daisyUI 5.

- **Language:** TypeScript 6 (`strict: true`)
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 4, daisyUI 5
- **State / Data:** TanStack Query 5, Zustand 5 (immer + devtools middleware)
- **HTTP / Realtime:** ky, sockjs-client, @stomp/stompjs
- **Date / Utility:** dayjs, classnames, lodash, uuid, immer, overlay-kit
- **UI Utilities:** react-icons, timeago-react (+ timeago.js), lottie-react
- **Lint / Format:** `@bob-park/eslint-config-bobpark`, `@bob-park/prettier-config-bobpark`

Refer to `package.json` for exact pinned versions.

# AGENTS.md

Convention reference for code agents (Claude Code, Cursor, Codex, Aider, etc.)
working in this repository. 본문은 영어, 도메인/비즈니스 용어는 한국어를 유지한다.

세부 규칙은 `docs/agents/` 아래의 토픽별 문서를 참조한다. 각 문서는
frontmatter (`title`, `scope`, `applies_to`, `related`) 와 TL;DR blockquote 로
시작하므로, 작업 전 해당 파일의 첫 5~10줄만 확인해도 적용 여부를 판단할 수 있다.

## Map

### Foundations
- [Project Overview](docs/agents/overview.md) — KeyFlow 연동 (better-auth) Next.js 템플릿의 목적과 경계
- [Tech Stack](docs/agents/tech-stack.md) — 언어/프레임워크/라이브러리 핀 버전 위치
- [Directory & Layout Rules](docs/agents/structure.md) — `src/` 트리, 도메인 추가 절차, `_layout/` 규칙

### Conventions (`src/**/*.{ts,tsx}`)
- [Module & Path Aliases](docs/agents/conventions/module-aliases.md)
- [File Naming](docs/agents/conventions/naming.md)
- [TypeScript](docs/agents/conventions/typescript.md)
- [React Section Comments](docs/agents/conventions/react-sections.md)

### Library Patterns
- [Zustand Slice](docs/agents/libs/zustand-slice.md) — `SlicePattern`, action naming, immer
- [ky + React Query](docs/agents/libs/ky-react-query.md) — 공유 `api`, query key, mutation, Server fetch+cache, RQProvider, HydrationBoundary
- [Tailwind 4 + daisyUI 5](docs/agents/libs/tailwind-daisyui.md) — `classnames`, theme cookie
- [next-intl v4](docs/agents/libs/next-intl.md) — wiring, locale resolution, server/client usage
- [Theme](docs/agents/libs/theme.md) — `data-theme` cookie + `setTheme` server action
- [overlay-kit](docs/agents/libs/overlay-kit.md) — `overlay.open` + `close`/`unmount` cleanup timing

### Workflows
- [Dev Environment & Lint/Format](docs/agents/workflows/dev-env.md) — `mise`, `yarn`, lint 명령
- [Git Workflow](docs/agents/workflows/git.md) — branch, commit prefix, PR base
- [Build & Release](docs/agents/workflows/build-release.md) — Docker buildx bake, version pattern

## Auth (better-auth)

The app integrates directly with the KeyFlow Authorization Server via
[better-auth](https://www.better-auth.com/) (`genericOAuth` plugin + PKCE).

- `/login` and `/logout` are **route handlers** (`src/app/login/route.ts`,
  `src/app/logout/route.ts`), not pages — they redirect immediately without
  React rendering.
- `/logout` performs the better-auth session signOut, then redirects to the
  KeyFlow OIDC end session endpoint (`/connect/logout`) with `id_token_hint`.
- `/api/**` goes through a catch-all proxy (`src/app/api/[...path]/route.ts`)
  that resolves the access token server-side and forwards the request to
  `API_HOST` with an `Authorization: Bearer` header — the access token is never
  exposed to the browser.
- better-auth config: `src/shared/auth/index.ts` (server),
  `src/shared/auth/auth-client.ts` (client). Session guard: `src/proxy.ts`.

## How to use

- 새 도메인 추가 → `structure.md` → `libs/ky-react-query.md` → `libs/zustand-slice.md`
- 새 locale 추가 → `libs/next-intl.md` 의 "Adding a locale" 섹션
- 새 layout sub-component → `structure.md` 의 "App Router `_layouts/`" 섹션
- 새 page sub-component → `structure.md` 의 "Page sub-components" 섹션
- Modal 열기 → `libs/overlay-kit.md`
- Theme 전환 → `libs/theme.md`
- Server-side data fetch → `libs/ky-react-query.md` 의 "Server-side fetch" 섹션
- PR 올리기 → `workflows/git.md`

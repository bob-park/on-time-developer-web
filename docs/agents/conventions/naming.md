---
title: File Naming
scope: src/**
applies_to: creating any new file
related:
  - ./react-sections.md
  - ../structure.md
---

# File Naming

> DTO `*.dto.ts`, ambient `index.ts`, 컴포넌트 `PascalCase.tsx`, hook `useXxx.tsx`, 도메인 fetcher `<domain>.ts` (sub-resource 는 `<domain><SubResource>.ts`).

## Basic rules

- API request/response types: `*.dto.ts` (e.g. `users.dto.ts`).
- Ambient global types (no `export`): `index.ts`.
- React components: `PascalCase.tsx`. Hooks: `useXxx.tsx`.
- Domain API fetcher files: lowercase domain name (e.g. `users.ts`).

## Sub-resource API files

도메인이 하위 리소스를 가질 때, sub-resource 마다 별도 파일로 분리한다. 파일명은 **도메인 prefix + sub-resource 이름 (camelCase)**.

```text
src/domain/sessions/apis/
├── sessions.ts                 # 메인 도메인 fetcher
├── sessions.dto.ts
├── sessionChairs.ts            # 하위 리소스 fetcher
├── sessionChairs.dto.ts
├── sessionReviewers.ts
└── sessionReviewers.dto.ts
```

규칙:

- 한 파일에 하나의 sub-resource 의 CRUD fetcher 만 담는다. `sessions.ts` 가 비대해지면 sub-resource 추출 신호.
- DTO 파일도 같은 prefix 규약을 따른다 (`sessionChairs.dto.ts`).
- React Query hook 도 같은 분리를 따른다: `queries/sessionChairs.tsx`.
- query key 는 `[domain, subResource, ...specifier]` — 예: `['sessions', 'chairs', sessionId]`. 자세히는 [ky + React Query](../libs/ky-react-query.md).

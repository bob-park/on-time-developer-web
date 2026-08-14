---
title: React Components & Section Comments
scope: src/**/*.tsx
applies_to: client components ('use client'), client hooks (useXxx.tsx), shared providers
related:
  - ./naming.md
  - ../libs/zustand-slice.md
  - ../libs/ky-react-query.md
---

# React Components & Section Comments

> Server Component 가 기본. `'use client'` 컴포넌트 / client hook / shared provider 는 함수 본문을 11개 고정 순서 섹션 주석으로 구분한다. 사용하지 않는 섹션은 생략 (빈 헤더 금지).

## Server vs Client

- Server Components are the default. Add `'use client'` at the top **only when state, effects, event handlers, or browser APIs are needed**.
- Pattern: `default export` the public component; co-locate small non-reusable sub-components in the same file.

## Section comment order

`'use client'` 컴포넌트, client hook (`useXxx.tsx`), shared provider 는 함수 본문을 아래 섹션 주석으로 구분한다. **순서는 고정**이며 사용하지 않는 섹션은 주석을 **생략**한다 (빈 헤더를 남기지 않는다).

순서:

1. `// ref` — `useRef`
2. `// context` — `useContext`
3. `// state` — `useState`, `useReducer`
4. `// store` — Zustand selector (`useStore(...)`)
5. `// hooks` — 위 섹션에 들어가지 않는 React / 외부 라이브러리 hook (예: Next.js `useRouter`, `usePathname`, `useSearchParams`)
6. `// queries` — React Query hook (`useXxx({...})`, mutation hook 포함)
7. `// useEffect`
8. `// useLayoutEffect`
9. `// handle` — 이벤트 핸들러 / 액션 함수 (`handleXxx`) 등 일반 함수 정의
10. `// memorize` — `useMemo`
11. `// callback` — `useCallback`

같은 섹션 안에서는 여러 줄을 자유롭게 작성한다. 같은 파일에 co-locate 된 sub-component (예: `UserList.tsx` 의 `UserItem`) 도 동일 규칙을 따른다. Server Component (디렉티브 없음) 은 적용 대상이 아니다.

## Standard example

```tsx
'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useStore } from '@/shared/store/rootStore';
// ContentsContext, useContents 는 도메인별 placeholder

export default function Contents() {
  // ref
  const containerRef = useRef<HTMLDivElement>(null);

  // context
  const { contents } = useContext(ContentsContext);

  // state
  const [open, setOpen] = useState<boolean>(false);

  // store
  const showAddUserModal = useStore((s) => s.showAddUserModal);

  // hooks
  const router = useRouter();

  // queries
  const { list, isLoading } = useContents({ size: 10, page: 0 });

  // useEffect
  useEffect(() => {
    // ...
  }, [open]);

  // handle
  const handleClick = () => {
    // ...
  };

  // memorize
  const memoized = useMemo(() => transform(list), [list]); // expensive transform 예시

  // callback
  const handleSelect = useCallback((id: string) => {
    // ...
  }, []);

  return <div>...</div>;
}
```

## Migration policy

기존 파일은 일괄 마이그레이션하지 않는다. 해당 파일을 다른 작업으로 수정할 때 같은 PR 안에서 점진적으로 정리한다.

---
title: Theme — cookie + server action
scope: src/shared/providers/theme/**, src/app/themeAction.ts, src/app/layout.tsx
applies_to: theme switching, cookie-driven dark mode, theme bridge for UI libraries
related:
  - ./next-intl.md
  - ./tailwind-daisyui.md
---

# Theme — cookie + server action

> 테마는 `theme` cookie 에 저장되어 `<html data-theme={theme}>` 에 적용된다. 변경은 `setTheme` server action 통해서만. 패턴은 [next-intl](./next-intl.md) 의 locale 변경과 동일 구조.

## Storage

- Cookie 이름: `theme` (상수는 root layout 과 server action 양쪽에 `COOKIE_NAME_THEME` 으로 정의).
- 값: `'light' | 'dark'` 등 `Theme` 타입 (정의: `src/shared/providers/theme/ThemeProvider.tsx`).
- Default: cookie 가 없으면 `'light'`.
- 적용 위치: root layout 의 `<html data-theme={theme}>` — Tailwind `@custom-variant dark` 와 daisyUI theme 둘 다 이 attribute 로 분기.

## Server action

```ts
// src/app/themeAction.ts
'use server';

import { cookies } from 'next/headers';

import { Theme } from '@/shared/providers/theme/ThemeProvider';

const COOKIE_NAME_THEME = 'theme';

export async function setTheme(theme: Theme) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME_THEME, theme);
}
```

- Client 에서 cookie 를 직접 set 하지 않는다 — 항상 `setTheme(...)` server action 을 호출.
- Server action 이 cookie 를 갱신한 뒤, 다음 navigation 또는 revalidation 시점에 root layout 이 새 cookie 값을 읽어 `<html data-theme>` 을 업데이트.

## Reading in root layout

```tsx
// src/app/layout.tsx (Server Component)
import { cookies } from 'next/headers';

import { Theme } from '@/shared/providers/theme/ThemeProvider';

const COOKIE_NAME_THEME = 'theme';

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();

  const theme = (cookieStore.get(COOKIE_NAME_THEME)?.value ?? 'light') as Theme;

  return (
    <html lang="ko" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
```

## Bridging into UI libraries

3rd-party UI library 가 자체 테마 시스템을 가지면 (예: antd `ConfigProvider`), root layout 에서 cookie 로 읽은 `theme` 값을 해당 provider 에 전달해 SSR 부터 동기 적용한다. 컴포넌트 트리 안에서는 React context 가 아니라 root-supplied prop 으로 받는다.

## Why server action (not client cookie write)

- Cookie 를 client 에서 write 하면 root layout 이 다시 렌더링되지 않아 `<html data-theme>` 이 즉시 갱신되지 않는다.
- Server action 으로 cookie 를 갱신하면 다음 server render 에서 root layout 이 새 값을 반영한다. Client 단의 즉각 반영이 필요하면 server action 호출 후 `router.refresh()` 또는 `revalidatePath('/', 'layout')` 를 함께 호출.
- 같은 이유로 [next-intl](./next-intl.md) 의 `setLocale` 도 동일 패턴을 따른다. 새 cookie-driven 글로벌 상태가 추가되면 이 패턴을 재사용한다.

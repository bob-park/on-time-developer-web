---
title: next-intl v4
scope: src/shared/i18n/**, src/app/**/{layout,page}.tsx, messages/**
applies_to: i18n wiring, locale resolution, translation usage, locale change
related:
  - ../structure.md
  - ../conventions/react-sections.md
---

# next-intl v4

> next-intl v4 사용. plugin 진입점은 `src/shared/i18n/request.ts`. locale 우선순위 = cookie → Accept-Language → `DEFAULT_LOCALE`. server 는 `getTranslations` / `getMessages`, client 는 `useTranslations` / `useLocale`. locale 변경은 `setLocale` server action.

i18n 라이브러리는 `next-intl` v4 를 사용한다. 라이브러리 버전이 바뀌면 본 문서도 함께 갱신한다 (정확한 핀 버전은 `package.json` 참조).

## Library & wiring

- `next.config.ts` 에서 plugin 으로 wrap 한다. **단일 진입점**:

  ```ts
  // next.config.ts
  const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
  export default withNextIntl(nextConfig);
  ```

- 런타임 messages 로딩은 `src/shared/i18n/request.ts` 의 `getRequestConfig` 에서 수행한다. 이 파일을 다른 경로로 옮기지 않는다 (plugin 인자가 같이 바뀌어야 함).

## Locale resolution

`src/shared/i18n/locale.ts` 의 `getUserLocale()` (server-only) 가 다음 우선순위로 locale 을 결정한다:

1. `locale` cookie (`COOKIE_NAME_LOCALE`) — 값이 `SUPPORTED_LOCALES` 에 속할 때.
2. `Accept-Language` 헤더 전체 문자열(소문자 변환) 이 `SUPPORTED_LOCALES` 중 하나의 코드로 시작할 때 (예: `"ko-KR,en;q=0.9"` → `'ko'` 매칭).
3. 위 두 조건 모두 실패 → `DEFAULT_LOCALE` (`'ko'`).

`SUPPORTED_LOCALES`, `LOCALE_META`, `DEFAULT_LOCALE`, `COOKIE_NAME_LOCALE`, `LOCALE_COOKIE_MAX_AGE` 는 **모두 `src/shared/i18n/config.ts` 에 한 번만 정의**한다 (single source of truth). 다른 곳에서 같은 상수를 재정의하지 않는다.

## Message files

- 위치: 저장소 루트 `messages/<locale>.json` (예: `messages/ko.json`, `messages/en.json`).
- 키 구조: `namespace.key` 네스팅. 예:

  ```json
  { "metadata": { "title": "...", "description": "..." } }
  ```

- 사용 시 `getTranslations('metadata')` 또는 `useTranslations('metadata')` 처럼 namespace 단위로 호출한다.

### Adding a locale

새 locale 추가 절차 (세 곳을 동기 갱신):

1. `src/shared/i18n/config.ts` 의 `SUPPORTED_LOCALES` 에 코드 추가.
2. 같은 파일의 `LOCALE_META` 에 `{ code, label, htmlLang }` 추가.
3. `messages/<new-locale>.json` 신규 작성 — 기존 locale 의 모든 키를 채운다.

## Usage — server vs client

- **Server Component / Route Handler / `generateMetadata`** — `next-intl/server` 의 `getTranslations(namespace)` (서버에서 직접 렌더링 시) 또는 `getMessages()` (client 트리에 전달할 메시지 번들이 필요할 때, 예: `<NextIntlClientProvider messages={...}>`) 를 사용한다. 동기 hook (`useTranslations`) 은 서버 컴포넌트에서 사용하지 않는다.
- **Client Component** — `next-intl` 의 `useTranslations(namespace)`, `useLocale()` 을 사용한다. `useLocale` / `useTranslations` 은 [React Section Comments](../conventions/react-sections.md) 의 `// hooks` 섹션 아래에 둔다.
- **Client hydration** — `RootLayout` 에서 `<NextIntlClientProvider locale={locale} messages={messages}>` 로 client 트리를 감싼다 (이미 구현됨, `src/app/layout.tsx`).

예시 — Server (metadata) + Client (UI):

```tsx
// src/app/layout.tsx (Server Component) — metadata 에서 사용
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('metadata');
  return { title: t('title'), description: t('description') };
}
```

```tsx
// Client Component
'use client';

import { useLocale, useTranslations } from 'next-intl';

export default function Greeting() {
  // hooks
  const t = useTranslations('metadata');
  const locale = useLocale();

  return <span lang={locale}>{t('title')}</span>;
}
```

## Locale change

- 진입 함수: `src/shared/i18n/localeAction.ts` 의 `setLocale(locale)` server action.
  - `locale` cookie 저장 (`maxAge = LOCALE_COOKIE_MAX_AGE`, `sameSite: 'lax'`).
  - `revalidatePath('/', 'layout')` 으로 root layout 재검증 → 새 locale 메시지가 트리에 반영된다.
- UI 진입점: `src/shared/components/i18n/LanguageSwitcher.tsx`. 새로운 locale 변경 UI 가 필요하면 이 컴포넌트를 재사용하거나, 동일하게 `setLocale` + `useTransition` 패턴을 따른다.
- 클라이언트에서 직접 cookie 를 조작하지 않는다 — 항상 `setLocale` 을 통한다.

# OnTime Developer Web — 커밋 기반 보고 도구 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 개발자 본인의 커밋을 조회하고 webLLM 으로 일일/주간 보고서를 생성하는 4개 화면(대시보드/커밋 목록/일일 보고/주간 보고) + 전역 챗봇을 구현한다.

**Architecture:** 커밋 조회 API(`GET /api/v1/developers/commits`) 하나를 ky + React Query 로 감싸고, 대시보드 통계·보고서 입력은 클라이언트에서 계산한다. LLM 은 기존 `useWebLlm`(web worker + `@mlc-ai/web-llm`) 을 정리해 재사용하고, 보고서 결과는 저장 없이 화면 표시 + 클립보드 복사만 한다.

**Tech Stack:** Next.js App Router, ky, @tanstack/react-query, Tailwind 4 + daisyUI 5, next-intl v4, dayjs, @mlc-ai/web-llm

**Spec:** `docs/superpowers/specs/2026-08-14-ontime-developer-web-design.md`

## Global Constraints

- 패키지 매니저는 `yarn`. **신규 dependency 추가 금지** (차트도 div 로 그린다).
- 모든 태스크는 커밋 전 `yarn lint` 통과 필수.
- `'use client'` 컴포넌트/훅은 `docs/agents/conventions/react-sections.md` 의 섹션 주석 순서(`// ref` → `// state` → `// hooks` → `// queries` → `// useEffect` → `// handle` → …)를 지킨다. 사용하지 않는 섹션 주석은 생략.
- 조건부 class 는 `import cx from 'classnames'`. daisyUI 토큰(`btn`, `navbar`, `dropdown`, `card`, `progress`, `input`, `badge`)을 raw Tailwind 보다 우선.
- 컴포넌트 파일명 `PascalCase.tsx`. layout sub-component 는 `_layouts/`, page sub-component 는 `_components/`.
- UI 문자열은 `messages/ko.json` + `messages/en.json` 둘 다 추가 (next-intl). LLM 프롬프트는 i18n 대상 아님 (한국어 상수).
- Query key 는 `['commits', ...specifier]`.
- 커밋 메시지는 기존 히스토리 스타일(한국어 + `feat:`/`refactor:` prefix) 유지.
- API 는 `/api/**` catch-all proxy 경유 — 공유 `api` (ky) 인스턴스 사용, 토큰은 서버가 붙인다.
- **스펙과 다른 확정 사항 2건:**
  1. 테마 이름은 `ontime-dark`/`ontime-light` 대신 기존 `light`/`dark` 를 유지하고 팔레트만 커스텀으로 덮어쓴다 — `Theme` 타입/쿠키/`dark` custom-variant 를 건드리지 않기 위함.
  2. `author` 파라미터는 기본 전송하지 않는다 — `/v1/developers/commits` 는 인증 토큰으로 개발자 본인 범위가 잡히는 엔드포인트이고, 세션 username 과 git author 문자열이 일치한다는 보장이 없다. (다른 사용자 커밋이 보이면 그때 필터를 붙인다.)
- 테스트 프레임워크가 없는 프로젝트 — 태스크별 검증은 `yarn lint`, 마지막 태스크에서 `yarn build` + 수동 체크리스트.

---

### Task 1: 테마 팔레트 (light / dark 커스텀)

**Files:**
- Modify: `src/app/globals.css` (현재 24줄 — `@plugin 'daisyui';` 라인 교체)

**Interfaces:**
- Consumes: 없음
- Produces: daisyUI semantic 토큰 (`bg-base-100/200/300`, `text-base-content`, `btn-primary`, `text-error` 등). 이후 모든 태스크는 hex 직접 사용 금지, 이 토큰만 사용.

- [ ] **Step 1: globals.css 의 `@plugin 'daisyui';` 를 커스텀 테마 정의로 교체**

```css
@plugin 'daisyui' {
  themes: light --default, dark;
}

@plugin 'daisyui/theme' {
  name: 'dark';
  color-scheme: dark;
  --color-base-100: #121212;
  --color-base-200: #181818;
  --color-base-300: #1f1f1f;
  --color-base-content: #ffffff;
  --color-primary: #1ed760;
  --color-primary-content: #000000;
  --color-secondary: #1f1f1f;
  --color-secondary-content: #ffffff;
  --color-accent: #1ed760;
  --color-accent-content: #000000;
  --color-neutral: #252525;
  --color-neutral-content: #b3b3b3;
  --color-info: #539df5;
  --color-info-content: #000000;
  --color-success: #1ed760;
  --color-success-content: #000000;
  --color-warning: #ffa42b;
  --color-warning-content: #000000;
  --color-error: #f3727f;
  --color-error-content: #000000;
  --radius-selector: 2rem;
  --radius-field: 2rem;
  --radius-box: 0.5rem;
}

@plugin 'daisyui/theme' {
  name: 'light';
  color-scheme: light;
  --color-base-100: #fafafa;
  --color-base-200: #ffffff;
  --color-base-300: #eeeeee;
  --color-base-content: #121212;
  --color-primary: #169c46;
  --color-primary-content: #ffffff;
  --color-secondary: #eeeeee;
  --color-secondary-content: #121212;
  --color-accent: #169c46;
  --color-accent-content: #ffffff;
  --color-neutral: #e5e5e5;
  --color-neutral-content: #6a6a6a;
  --color-info: #2d76d9;
  --color-info-content: #ffffff;
  --color-success: #169c46;
  --color-success-content: #ffffff;
  --color-warning: #b26a00;
  --color-warning-content: #ffffff;
  --color-error: #cc2f43;
  --color-error-content: #ffffff;
  --radius-selector: 2rem;
  --radius-field: 2rem;
  --radius-box: 0.5rem;
}
```

주의: `@import 'tailwindcss';`, `@custom-variant dark ...`, toast keyframes 는 그대로 둔다. base-200 이 카드 서피스(다크 `#181818` / 라이트 `#ffffff`), base-100 이 페이지 배경이다.

- [ ] **Step 2: `yarn lint` 실행 → 통과 확인**

- [ ] **Step 3: `yarn dev` 로 테마 전환 확인** — 기존 ThemeSwitcher 로 light/dark 전환 시 배경/버튼 색이 새 팔레트로 바뀌는지 확인

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: daisyUI light/dark 커스텀 테마 팔레트 추가"
```

---

### Task 2: commits 도메인 (dto + api + queries)

**Files:**
- Create: `src/domain/commits/apis/commits.dto.ts`
- Create: `src/domain/commits/apis/commits.ts`
- Create: `src/domain/commits/queries/commits.tsx`

(`store/` 는 클라이언트 전역 상태가 없어 생략 — git 은 빈 디렉토리를 추적하지 못한다. `components/` 는 Task 7 에서 파일과 함께 생성.)

**Interfaces:**
- Consumes: `api`, `toSearchParams`, `getNextPageParams` (`@/shared/api`), `PagedModel`, `PageRequest` (`@/shared/api/common.dto`)
- Produces:
  - `Commit` — `{ id: string; commitId: string; repo: string; branch: string; author: string; commitMessage: string; createdDate: string; createdBy: string; lastModifiedDate?: string; lastModifiedBy?: string }`
  - `CommitSearchRequest` — `{ repo?: string; branch?: string; author?: string; commitMessage?: string; createdDateFrom?: string; createdDateTo?: string }` (날짜는 `YYYY-MM-DDTHH:mm:ss` 문자열)
  - `getCommits(params: CommitSearchRequest & PageRequest): Promise<PagedModel<Commit>>`
  - `useCommits(params)` → `{ commits: Commit[], isLoading, fetchNextPage, hasNextPage, totalElements: number }`
  - `usePeriodCommits(from: string, to: string)` → `{ commits: Commit[], isLoading }` (size 1000 단건 조회)

- [ ] **Step 1: `src/domain/commits/apis/commits.dto.ts` 작성**

```ts
interface Commit {
  id: string;
  commitId: string;
  repo: string;
  branch: string;
  author: string;
  commitMessage: string;
  createdDate: string;
  createdBy: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
}

type CommitSearchRequest = {
  repo?: string;
  branch?: string;
  author?: string;
  commitMessage?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
};

export type { Commit, CommitSearchRequest };
```

- [ ] **Step 2: `src/domain/commits/apis/commits.ts` 작성**

```ts
import { Commit, CommitSearchRequest } from '@/domain/commits/apis/commits.dto';
import api, { toSearchParams } from '@/shared/api';
import { PageRequest, PagedModel } from '@/shared/api/common.dto';

export async function getCommits(params: CommitSearchRequest & PageRequest) {
  return api
    .get('/api/v1/developers/commits', { searchParams: toSearchParams(params) })
    .json<PagedModel<Commit>>();
}
```

- [ ] **Step 3: `src/domain/commits/queries/commits.tsx` 작성**

```tsx
import { InfiniteData, QueryKey, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getCommits } from '@/domain/commits/apis/commits';
import { Commit, CommitSearchRequest } from '@/domain/commits/apis/commits.dto';
import { getNextPageParams } from '@/shared/api';
import { PageRequest, PagedModel } from '@/shared/api/common.dto';

export function useCommits(params: CommitSearchRequest) {
  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery<
    PagedModel<Commit>,
    unknown,
    InfiniteData<PagedModel<Commit>>,
    QueryKey,
    PageRequest
  >({
    queryKey: ['commits', params],
    queryFn: ({ pageParam }) => getCommits({ ...params, ...pageParam }),
    initialPageParam: {
      size: 25,
      page: 0,
    },
    getNextPageParam: (lastPage) => getNextPageParams<Commit>(lastPage),
  });

  const commits = (data?.pages || []).reduce((current, value) => current.concat(value.content), [] as Commit[]);

  const totalElements = data?.pages[0]?.page.totalElements ?? 0;

  return { isLoading, fetchNextPage, hasNextPage, commits, totalElements };
}

export function usePeriodCommits(from: string, to: string) {
  const { data, isLoading } = useQuery<PagedModel<Commit>>({
    queryKey: ['commits', 'period', from, to],
    queryFn: () =>
      getCommits({
        createdDateFrom: from,
        createdDateTo: to,
        page: 0,
        // ponytail: 기간 내 1000건 초과분은 통계에서 잘림 — 집계 API 생기면 교체
        size: 1_000,
        sort: ['createdDate,desc'],
      }),
  });

  return { commits: data?.content ?? [], isLoading };
}
```

주의: 기존 `useUsers` 와 달리 `queryKey` 에 `params` 객체 전체를 넣는다 — 필터가 바뀌면 refetch 되어야 한다. `queryFn` 은 `pageParam` 을 merge 한다 (기존 `useUsers` 는 `pageParam` 을 무시하는 버그가 있다 — 따라하지 말 것).

- [ ] **Step 4: `yarn lint` 실행 → 통과 확인**

- [ ] **Step 5: Commit**

```bash
git add src/domain/commits
git commit -m "feat: commits 도메인 추가 (api + react query)"
```

---

### Task 3: useWebLlm 정리 + 단건 생성(onGenerate) 추가

**Files:**
- Modify: `src/shared/components/llm/useWebLlm.tsx` (전체 재작성)

**Interfaces:**
- Consumes: `getEngine` (`@/shared/components/llm/engine`) — 변경 없음
- Produces: `useWebLlm(modelId?)` 반환값:
  - `status: 'loading' | 'ready' | 'unsupported'` — `isSupport` 는 **제거**
  - `progress: number` (0~1), `isStreaming: boolean`
  - `messages: ChatMessages[]`, `onChatCompletion({ system?, user })` — 기존과 동일 (챗봇용)
  - `onGenerate({ system?, user, onDelta }): Promise<string>` — messages 를 건드리지 않는 1회성 스트리밍 (보고서용). `onDelta(fullText)` 는 누적 전체 텍스트를 넘긴다.

- [ ] **Step 1: `useWebLlm.tsx` 재작성**

기존 파일에서 바꿀 것: (1) Chrome 아님 분기에서 `setIsSupport(false)` 대신 `setStatus('unsupported')` 후 return — 현재는 status 가 `'loading'` 에 영원히 머문다. (2) `isSupport` state 제거. (3) 스트리밍 루프의 `console.log` 2개 제거. (4) `onGenerate` 추가.

```tsx
'use client';

import { useEffect, useState } from 'react';

import { v4 as uuid } from 'uuid';

import { getEngine } from './engine';

type EngineStatus = 'loading' | 'ready' | 'unsupported';

type ChatMessages = {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  date: Date;
};

export default function useWebLlm(modelId?: string) {
  // state
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessages[]>([]);

  // useEffect
  useEffect(() => {
    if (!('gpu' in navigator) || !navigator.userAgent.includes('Chrome')) {
      setStatus('unsupported');
      return;
    }

    getEngine({ modelId }, (_, p) => setProgress(p)).then(() => setStatus('ready'));
  }, []);

  // handle
  const handleGenerate = async ({
    system = '',
    user,
    onDelta,
  }: {
    system?: string;
    user: string;
    onDelta?: (fullText: string) => void;
  }) => {
    setIsStreaming(true);

    try {
      const engine = await getEngine({ modelId });

      const stream = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        stream: true,
      });

      let fullText = '';

      for await (const chunk of stream) {
        fullText += chunk.choices[0].delta.content ?? '';
        onDelta?.(fullText);
      }

      return fullText;
    } finally {
      setIsStreaming(false);
    }
  };

  const handleChatCompletion = async ({ system = '', user }: { system?: string; user: string }) => {
    const userMessage: ChatMessages = { id: uuid(), type: 'user', message: user, date: new Date() };
    const assistantMessage: ChatMessages = { id: uuid(), type: 'assistant', message: '', date: new Date() };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    await handleGenerate({
      system,
      user,
      onDelta: (fullText) =>
        setMessages((prev) => prev.map((item) => (item.id === assistantMessage.id ? { ...item, message: fullText } : item))),
    });
  };

  return { status, progress, messages, isStreaming, onChatCompletion: handleChatCompletion, onGenerate: handleGenerate };
}
```

- [ ] **Step 2: 기존 사용처 확인** — `grep -rn 'useWebLlm' src` 실행. 현재 유일한 사용처는 `src/app/page.tsx` (데모, `isSupport` 미사용 — Task 4 에서 삭제됨). 다른 사용처가 새로 생겼다면 `isSupport` 참조를 `status === 'unsupported'` 로 바꾼다.

- [ ] **Step 3: `yarn lint` 실행 → 통과 확인**

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/llm/useWebLlm.tsx
git commit -m "refactor: useWebLlm 상태 정리 및 단건 생성(onGenerate) 추가"
```

---

### Task 4: `/` → `/dashboard` redirect + 라우트 스캐폴딩

**Files:**
- Modify: `src/app/page.tsx` (전체 교체 — webLLM 데모 삭제)
- Create: `src/app/dashboard/page.tsx`, `src/app/commits/page.tsx`, `src/app/reports/daily/page.tsx`, `src/app/reports/weekly/page.tsx` (placeholder — 이후 태스크가 채움)

**Interfaces:**
- Consumes: 없음
- Produces: 4개 라우트 존재. 각 페이지는 server component 로 두고 본문은 이후 태스크의 `_components/*Contents.tsx` 가 담당.

- [ ] **Step 1: `src/app/page.tsx` 교체**

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
```

- [ ] **Step 2: 4개 placeholder 페이지 생성** — 각 파일 내용 (제목만 다르게):

```tsx
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return <div className="p-6" />;
}
```

`src/app/commits/page.tsx` → `CommitsPage`, `src/app/reports/daily/page.tsx` → `DailyReportPage`, `src/app/reports/weekly/page.tsx` → `WeeklyReportPage` 로 함수명만 바꿔 동일하게 생성.

- [ ] **Step 3: `yarn lint` → 통과, `yarn dev` 로 `/` 접속 시 `/dashboard` 이동 확인**

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/dashboard src/app/commits src/app/reports
git commit -m "feat: 라우트 스캐폴딩 및 홈 대시보드 redirect"
```

---

### Task 5: Header — 로고 + nav(모바일 햄버거) + 아바타 드롭다운

**Files:**
- Modify: `src/app/_layouts/Header.tsx` (전체 재작성, server component 유지)
- Create: `src/app/_layouts/HeaderNav.tsx` (client — active 표시에 `usePathname` 필요)
- Modify: `messages/ko.json`, `messages/en.json`

**Interfaces:**
- Consumes: `getUserinfo` (`@/shared/auth/serverAction`), `ThemeSwitcher`, `LanguageSwitcher`, `UserAvatar` (`@/domain/users/components/UserAvatar`)
- Produces: `Header`(서버, props 없음 — layout.tsx 의 기존 `<Header />` 그대로), `HeaderNav`(client, props 없음)

- [ ] **Step 1: messages 에 nav 문자열 추가**

`messages/ko.json` 에 추가:

```json
"nav": {
  "dashboard": "대시보드",
  "commits": "커밋 목록",
  "dailyReport": "일일 보고",
  "weeklyReport": "주간 작업 보고",
  "logout": "로그아웃"
}
```

`messages/en.json` 에 추가:

```json
"nav": {
  "dashboard": "Dashboard",
  "commits": "Commits",
  "dailyReport": "Daily Report",
  "weeklyReport": "Weekly Report",
  "logout": "Logout"
}
```

- [ ] **Step 2: `src/app/_layouts/HeaderNav.tsx` 작성**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const MENUS = [
  { key: 'dashboard', href: '/dashboard' },
  { key: 'commits', href: '/commits' },
  { key: 'dailyReport', href: '/reports/daily' },
  { key: 'weeklyReport', href: '/reports/weekly' },
] as const;

export default function HeaderNav() {
  // hooks
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <>
      {/* desktop */}
      <nav className="hidden flex-row items-center gap-1 md:flex">
        {MENUS.map((menu) => (
          <Link
            key={menu.key}
            href={menu.href}
            className={cx('btn btn-ghost btn-sm', pathname.startsWith(menu.href) ? 'font-bold' : 'font-normal opacity-70')}
          >
            {t(menu.key)}
          </Link>
        ))}
      </nav>

      {/* mobile - hamburger */}
      <div className="dropdown md:hidden">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-square" aria-label="menu">
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-10 mt-2 w-52 p-2 shadow-lg">
          {MENUS.map((menu) => (
            <li key={menu.key}>
              <Link href={menu.href} className={cx(pathname.startsWith(menu.href) && 'font-bold')}>
                {t(menu.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
```

- [ ] **Step 3: `src/app/_layouts/Header.tsx` 재작성**

```tsx
import { cookies } from 'next/headers';
import Link from 'next/link';

import HeaderNav from '@/app/_layouts/HeaderNav';
import UserAvatar from '@/domain/users/components/UserAvatar';
import { getUserinfo } from '@/shared/auth/serverAction';
import LanguageSwitcher from '@/shared/components/i18n/LanguageSwitcher';
import ThemeSwitcher from '@/shared/components/theme/ThemeSwitcher';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { getTranslations } from 'next-intl/server';

const COOKIE_NAME_THEME = 'theme';

export default async function Header() {
  const cookieStore = await cookies();
  const theme = (cookieStore.get(COOKIE_NAME_THEME)?.value ?? 'light') as Theme;

  const userinfo = await getUserinfo();
  const t = await getTranslations('nav');

  return (
    <header className="navbar bg-base-200 sticky top-0 z-20 shadow-md">
      <div className="flex flex-1 flex-row items-center gap-2">
        <div className="md:hidden">
          <HeaderNav />
        </div>
        <Link href="/" className="flex flex-row items-center gap-2 px-2">
          <span className="bg-primary size-6 rounded-full" aria-hidden />
          <span className="text-lg font-bold">OnTime Developer</span>
        </Link>
        <div className="hidden md:block">
          <HeaderNav />
        </div>
      </div>

      <div className="flex flex-row items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher current={theme} />
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-circle btn-ghost">
            <UserAvatar src={userinfo && `/api/v1/users/${userinfo.id}/avatar`} username={userinfo?.name ?? '?'} />
          </div>
          <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-10 mt-2 w-40 p-2 shadow-lg">
            <li className="menu-title">{userinfo?.name}</li>
            <li>
              <a href="/logout">{t('logout')}</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
```

주의: `HeaderNav` 가 desktop nav 와 mobile 햄버거를 모두 렌더링하므로 Header 에서 한 번만 배치해도 되지만, 모바일에서 햄버거를 로고 왼쪽에 두기 위해 위처럼 두 곳에 두면 desktop/mobile 이 각각 `hidden`/`md:hidden` 으로 상호 배타라 중복 렌더링되지 않는다. 아바타는 404 시 `UserAvatar` 내장 fallback(이니셜)이 동작한다.

- [ ] **Step 4: `yarn lint` → 통과. `yarn dev` 에서 확인:** 데스크톱 nav 4메뉴/active 표시, 창 축소 시 햄버거 전환, 로고 클릭 → `/` → `/dashboard`, 아바타 드롭다운 + 로그아웃 링크

- [ ] **Step 5: Commit**

```bash
git add src/app/_layouts messages
git commit -m "feat: 헤더 개편 - 로고, nav(모바일 햄버거), 아바타 드롭다운"
```

---

### Task 6: 전역 챗봇 (FAB + 팝업 패널)

**Files:**
- Create: `src/shared/components/chatbot/Chatbot.tsx`
- Modify: `src/app/layout.tsx` (`<Footer />` 다음에 `<Chatbot />` 추가)
- Modify: `messages/ko.json`, `messages/en.json`

**Interfaces:**
- Consumes: `useWebLlm` (Task 3 — `status`, `progress`, `messages`, `isStreaming`, `onChatCompletion`)
- Produces: `Chatbot` (client, props 없음, 전 페이지 우하단 고정)

- [ ] **Step 1: messages 에 chatbot 문자열 추가**

`messages/ko.json`:

```json
"chatbot": {
  "title": "고객지원",
  "placeholder": "궁금한 것을 물어보세요",
  "loading": "AI 모델 로딩 중 (최초 1회)",
  "unsupported": "이 브라우저는 AI 기능을 지원하지 않습니다. Chrome 사용을 권장합니다.",
  "empty": "OnTime Developer 사용법을 안내해 드려요."
}
```

`messages/en.json`:

```json
"chatbot": {
  "title": "Support",
  "placeholder": "Ask me anything",
  "loading": "Loading AI model (first time only)",
  "unsupported": "This browser does not support AI features. Chrome is recommended.",
  "empty": "I can help you use OnTime Developer."
}
```

- [ ] **Step 2: `src/shared/components/chatbot/Chatbot.tsx` 작성**

```tsx
'use client';

import { useState } from 'react';

import useWebLlm from '@/shared/components/llm/useWebLlm';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const SYSTEM_PROMPT = `너는 "OnTime Developer" 웹사이트의 고객지원 챗봇이다. 아래 내용만 근거로 한국어로 짧고 친절하게 답한다. 모르는 내용은 모른다고 답한다.

OnTime Developer 는 개발자의 커밋 내역을 조회하고 AI 로 업무 보고서를 만드는 도구다.
- 대시보드(/dashboard): 이번주 커밋 수, 최다 커밋 저장소, 일일 커밋 수 차트, 최근 커밋을 보여준다.
- 커밋 목록(/commits): 내 커밋을 커밋 메시지/저장소/브랜치/기간으로 필터링해 조회한다.
- 일일 보고(/reports/daily): 날짜를 선택하고 "보고서 생성" 버튼을 누르면 그 날의 커밋으로 AI 가 보고서를 작성한다.
- 주간 보고(/reports/weekly): 주(월~일)를 선택해 같은 방식으로 주간 보고서를 작성한다.
- 보고서는 저장되지 않으며, 복사 버튼으로 클립보드에 복사할 수 있다.
- AI 기능은 브라우저 안에서 동작하며(WebGPU), Chrome 이 필요하다. 최초 1회 모델 다운로드가 필요하다.
- 테마(라이트/다크)와 언어는 우측 상단에서 변경한다. 로그아웃은 우측 상단 아바타 메뉴에 있다.`;

export default function Chatbot() {
  // state
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');

  // hooks
  const t = useTranslations('chatbot');
  const { status, progress, messages, isStreaming, onChatCompletion } = useWebLlm();

  // handle
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isStreaming || status !== 'ready') {
      return;
    }

    onChatCompletion({ system: SYSTEM_PROMPT, user: input.trim() });
    setInput('');
  };

  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3">
      {open && (
        <div className="card bg-base-200 flex h-[28rem] w-80 flex-col shadow-2xl max-sm:fixed max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:rounded-none">
          <div className="flex flex-row items-center justify-between p-3">
            <span className="font-bold">💬 {t('title')}</span>
            <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            {messages.length === 0 && <p className="text-sm opacity-60">{t('empty')}</p>}
            {messages.map((message) => (
              <div key={message.id} className={cx('chat', message.type === 'user' ? 'chat-end' : 'chat-start')}>
                <div
                  className={cx(
                    'chat-bubble text-sm whitespace-pre-wrap',
                    message.type === 'user' && 'chat-bubble-primary',
                  )}
                >
                  {message.message}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3">
            {status === 'unsupported' && <p className="text-warning text-sm">{t('unsupported')}</p>}
            {status === 'loading' && (
              <div className="flex flex-row items-center gap-2">
                <span className="text-xs opacity-60">{t('loading')}</span>
                <progress className="progress progress-primary flex-1" value={progress} max={1} />
              </div>
            )}
            {status === 'ready' && (
              <form className="flex flex-row gap-2" onSubmit={handleSubmit}>
                <input
                  className="input input-sm flex-1"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('placeholder')}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={isStreaming || !input.trim()}>
                  ➤
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-circle btn-lg shadow-xl"
        aria-label={t('title')}
        onClick={() => setOpen((prev) => !prev)}
      >
        💬
      </button>
    </div>
  );
}
```

주의: `useWebLlm` 은 모듈 레벨 singleton engine 을 공유하므로 챗봇을 열지 않아도 mount 시 모델 로딩이 시작된다. 이것이 의도 — 보고서 페이지 도착 전에 로딩이 진행된다.

- [ ] **Step 3: `src/app/layout.tsx` 에 챗봇 추가** — `import Chatbot from '@/shared/components/chatbot/Chatbot';` 후 `<Footer />` 다음 줄에 `<Chatbot />` 삽입 (ToastProvider 내부).

- [ ] **Step 4: `yarn lint` → 통과. `yarn dev` 확인:** 모든 페이지 우하단 FAB, 패널 열기/닫기, 로딩 progress → ready 후 질문/스트리밍 답변, 모바일 폭에서 풀스크린

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/chatbot src/app/layout.tsx messages
git commit -m "feat: 전역 고객지원 챗봇 추가"
```

---

### Task 7: 커밋 목록 페이지 (필터 + 무한 스크롤)

**Files:**
- Create: `src/domain/commits/components/CommitListItem.tsx`
- Create: `src/app/commits/_components/CommitsContents.tsx`
- Modify: `src/app/commits/page.tsx`
- Modify: `messages/ko.json`, `messages/en.json`

**Interfaces:**
- Consumes: `useCommits`, `Commit`, `CommitSearchRequest` (Task 2), `useInfinityScroll` (`@/shared/hooks/useInfinityScroll`), `dayjs` (`@/shared/dayjs`)
- Produces: `CommitListItem({ commit: Commit })` — 대시보드(Task 8)·보고서(Task 9)가 재사용하는 커밋 행 컴포넌트

- [ ] **Step 1: messages 에 commits 문자열 추가**

`messages/ko.json`:

```json
"commits": {
  "title": "커밋 목록",
  "searchPlaceholder": "커밋 메시지 검색",
  "repoPlaceholder": "저장소",
  "branchPlaceholder": "브랜치",
  "search": "검색",
  "reset": "초기화",
  "total": "총 {count}건",
  "empty": "커밋이 없습니다."
}
```

`messages/en.json`:

```json
"commits": {
  "title": "Commits",
  "searchPlaceholder": "Search commit message",
  "repoPlaceholder": "Repository",
  "branchPlaceholder": "Branch",
  "search": "Search",
  "reset": "Reset",
  "total": "{count} commits",
  "empty": "No commits found."
}
```

- [ ] **Step 2: `src/domain/commits/components/CommitListItem.tsx` 작성** (server/client 공용 — 디렉티브 없음)

```tsx
import { Commit } from '@/domain/commits/apis/commits.dto';
import dayjs from '@/shared/dayjs';

export default function CommitListItem({ commit }: Readonly<{ commit: Commit }>) {
  return (
    <div className="border-base-300 flex flex-col gap-1 border-b px-4 py-3 last:border-none">
      <div className="font-bold">{commit.commitMessage}</div>
      <div className="flex flex-row flex-wrap items-center gap-2 text-xs opacity-70">
        <span className="badge badge-sm badge-ghost">{commit.repo}</span>
        <span className="badge badge-sm badge-ghost">{commit.branch}</span>
        <span className="font-mono">{commit.commitId.slice(0, 7)}</span>
        <span>{commit.author}</span>
        <span>{dayjs(commit.createdDate).format('YYYY-MM-DD HH:mm')}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `src/app/commits/_components/CommitsContents.tsx` 작성**

```tsx
'use client';

import { useState } from 'react';

import { CommitSearchRequest } from '@/domain/commits/apis/commits.dto';
import CommitListItem from '@/domain/commits/components/CommitListItem';
import { useCommits } from '@/domain/commits/queries/commits';
import dayjs from '@/shared/dayjs';
import useInfinityScroll from '@/shared/hooks/useInfinityScroll';

import { useTranslations } from 'next-intl';

type FilterFields = {
  commitMessage: string;
  repo: string;
  branch: string;
  from: string;
  to: string;
};

const EMPTY_FILTER: FilterFields = { commitMessage: '', repo: '', branch: '', from: '', to: '' };

function toSearchRequest(fields: FilterFields): CommitSearchRequest {
  return {
    commitMessage: fields.commitMessage || undefined,
    repo: fields.repo || undefined,
    branch: fields.branch || undefined,
    createdDateFrom: fields.from ? dayjs(fields.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss') : undefined,
    createdDateTo: fields.to ? dayjs(fields.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : undefined,
  };
}

export default function CommitsContents() {
  // state
  const [fields, setFields] = useState<FilterFields>(EMPTY_FILTER);
  const [applied, setApplied] = useState<CommitSearchRequest>({});

  // hooks
  const t = useTranslations('commits');

  // queries
  const { commits, totalElements, isLoading, fetchNextPage, hasNextPage } = useCommits(applied);

  const [bottomRef] = useInfinityScroll({
    hasMore: !!hasNextPage,
    onNext: async () => {
      await fetchNextPage();
    },
  });

  // handle
  const handleChange = (key: keyof FilterFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(toSearchRequest(fields));
  };

  const handleReset = () => {
    setFields(EMPTY_FILTER);
    setApplied({});
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <form className="flex flex-row flex-wrap items-center gap-2" onSubmit={handleSearch}>
        <input
          className="input input-sm w-56"
          value={fields.commitMessage}
          onChange={handleChange('commitMessage')}
          placeholder={t('searchPlaceholder')}
        />
        <input
          className="input input-sm w-40"
          value={fields.repo}
          onChange={handleChange('repo')}
          placeholder={t('repoPlaceholder')}
        />
        <input
          className="input input-sm w-40"
          value={fields.branch}
          onChange={handleChange('branch')}
          placeholder={t('branchPlaceholder')}
        />
        <input className="input input-sm" type="date" value={fields.from} onChange={handleChange('from')} />
        <span className="opacity-60">~</span>
        <input className="input input-sm" type="date" value={fields.to} onChange={handleChange('to')} />
        <button type="submit" className="btn btn-primary btn-sm">
          {t('search')}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleReset}>
          {t('reset')}
        </button>
      </form>

      <div className="text-sm opacity-70">{t('total', { count: totalElements })}</div>

      <div className="bg-base-200 rounded-box shadow">
        {commits.map((commit) => (
          <CommitListItem key={commit.id} commit={commit} />
        ))}
        {!isLoading && commits.length === 0 && <p className="p-8 text-center opacity-60">{t('empty')}</p>}
        {isLoading && <div className="loading loading-spinner mx-auto my-8 block" />}
      </div>

      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
```

- [ ] **Step 4: `src/app/commits/page.tsx` 를 본문 렌더링으로 교체**

```tsx
import CommitsContents from './_components/CommitsContents';

export default function CommitsPage() {
  return <CommitsContents />;
}
```

- [ ] **Step 5: `yarn lint` → 통과. `yarn dev` 확인:** 목록 로드, 필터 검색/초기화, 스크롤 하단 도달 시 다음 페이지 로드, 0건 빈 상태

- [ ] **Step 6: Commit**

```bash
git add src/app/commits src/domain/commits/components messages
git commit -m "feat: 커밋 목록 페이지 추가 (필터 + 무한 스크롤)"
```

---

### Task 8: 대시보드

**Files:**
- Create: `src/app/dashboard/_components/DashboardContents.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/shared/dayjs/index.ts` (isoWeek plugin 추가 — 월요일 시작 주 계산)
- Modify: `messages/ko.json`, `messages/en.json`

**Interfaces:**
- Consumes: `usePeriodCommits` (Task 2), `CommitListItem` (Task 7), `dayjs`
- Produces: `dayjs().startOf('isoWeek')` 사용 가능 (Task 10 주간 보고도 사용)

- [ ] **Step 1: `src/shared/dayjs/index.ts` 에 isoWeek plugin 추가**

```ts
import isoWeek from 'dayjs/plugin/isoWeek';
```

를 import 목록에 추가하고 `dayjs.extend(isoWeek);` 를 기존 extend 라인들 옆에 추가.

- [ ] **Step 2: messages 에 dashboard 문자열 추가**

`messages/ko.json`:

```json
"dashboard": {
  "title": "대시보드",
  "weeklyCount": "이번주 커밋 수",
  "vsLastWeek": "지난주 대비",
  "topRepo": "이번주 최다 커밋",
  "dailyChart": "일일 커밋 수 (이번주)",
  "repoDistribution": "이번주 저장소별 커밋",
  "recentCommits": "최근 커밋",
  "viewAll": "전체 보기 →",
  "writeDailyReport": "오늘 일일 보고 작성",
  "writeWeeklyReport": "이번주 주간 보고 작성",
  "empty": "이번주 커밋이 없습니다."
}
```

`messages/en.json`:

```json
"dashboard": {
  "title": "Dashboard",
  "weeklyCount": "Commits this week",
  "vsLastWeek": "vs last week",
  "topRepo": "Top repository this week",
  "dailyChart": "Daily commits (this week)",
  "repoDistribution": "Commits by repository (this week)",
  "recentCommits": "Recent commits",
  "viewAll": "View all →",
  "writeDailyReport": "Write today's daily report",
  "writeWeeklyReport": "Write this week's report",
  "empty": "No commits this week."
}
```

- [ ] **Step 3: `src/app/dashboard/_components/DashboardContents.tsx` 작성**

```tsx
'use client';

import Link from 'next/link';

import { Commit } from '@/domain/commits/apis/commits.dto';
import CommitListItem from '@/domain/commits/components/CommitListItem';
import { usePeriodCommits } from '@/domain/commits/queries/commits';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

const WEEK_START = dayjs().startOf('isoWeek');
const LAST_WEEK_START = WEEK_START.subtract(1, 'week');

function countBy(commits: Commit[], keyOf: (commit: Commit) => string) {
  const counts = new Map<string, number>();

  commits.forEach((commit) => {
    const key = keyOf(commit);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export default function DashboardContents() {
  // hooks
  const t = useTranslations('dashboard');

  // queries
  const { commits, isLoading } = usePeriodCommits(
    LAST_WEEK_START.format('YYYY-MM-DDTHH:mm:ss'),
    WEEK_START.endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss'),
  );

  const thisWeek = commits.filter((commit) => !dayjs(commit.createdDate).isBefore(WEEK_START));
  const lastWeek = commits.filter((commit) => dayjs(commit.createdDate).isBefore(WEEK_START));

  const diff = thisWeek.length - lastWeek.length;

  const topRepoBranch = countBy(thisWeek, (commit) => `${commit.repo}|${commit.branch}`)[0];

  const dailyCounts = Array.from({ length: 7 }, (_, index) => {
    const day = WEEK_START.add(index, 'day');
    return {
      label: day.format('dd'),
      count: thisWeek.filter((commit) => dayjs(commit.createdDate).isSame(day, 'day')).length,
    };
  });
  const maxDaily = Math.max(1, ...dailyCounts.map((day) => day.count));

  const repoCounts = countBy(thisWeek, (commit) => commit.repo);
  const maxRepo = Math.max(1, ...repoCounts.map(([, count]) => count));

  const recent = commits.slice(0, 5);

  if (isLoading) {
    return <div className="loading loading-spinner mx-auto my-24 block" />;
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* stat tiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card bg-base-200 p-5 shadow">
          <div className="text-sm opacity-70">{t('weeklyCount')}</div>
          <div className="text-3xl font-bold">
            {thisWeek.length}{' '}
            <span className={diff >= 0 ? 'text-success text-sm' : 'text-error text-sm'}>
              {diff >= 0 ? '▲' : '▼'} {Math.abs(diff)} ({t('vsLastWeek')})
            </span>
          </div>
        </div>
        <div className="card bg-base-200 p-5 shadow">
          <div className="text-sm opacity-70">{t('topRepo')}</div>
          {topRepoBranch ? (
            <>
              <div className="truncate text-lg font-bold">{topRepoBranch[0].split('|')[0]}</div>
              <div className="text-sm opacity-70">
                {topRepoBranch[0].split('|')[1]} · {topRepoBranch[1]} commits
              </div>
            </>
          ) : (
            <div className="opacity-60">{t('empty')}</div>
          )}
        </div>
      </div>

      {/* daily bar chart */}
      <div className="card bg-base-200 p-5 shadow">
        <div className="mb-4 text-sm opacity-70">{t('dailyChart')}</div>
        <div className="flex h-32 flex-row items-end gap-3">
          {dailyCounts.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs opacity-70">{day.count}</span>
              <div
                className="bg-primary w-full rounded-t"
                style={{ height: `${(day.count / maxDaily) * 100}%`, opacity: day.count === maxDaily ? 1 : 0.55 }}
              />
              <span className="text-xs opacity-70">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* repo distribution */}
        <div className="card bg-base-200 p-5 shadow">
          <div className="mb-4 text-sm opacity-70">{t('repoDistribution')}</div>
          <div className="flex flex-col gap-2">
            {repoCounts.length === 0 && <p className="opacity-60">{t('empty')}</p>}
            {repoCounts.map(([repo, count]) => (
              <div key={repo} className="flex flex-row items-center gap-2 text-sm">
                <span className="w-52 truncate">{repo}</span>
                <div className="bg-base-300 h-3 flex-1 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${(count / maxRepo) * 100}%` }} />
                </div>
                <span className="w-6 text-right opacity-70">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* report shortcuts */}
        <div className="card bg-base-200 flex flex-col justify-center gap-3 p-5 shadow">
          <Link href="/reports/daily" className="btn btn-primary">
            ✨ {t('writeDailyReport')}
          </Link>
          <Link href="/reports/weekly" className="btn btn-outline">
            ✨ {t('writeWeeklyReport')}
          </Link>
        </div>
      </div>

      {/* recent commits */}
      <div className="card bg-base-200 shadow">
        <div className="flex flex-row items-center justify-between p-5 pb-0">
          <span className="text-sm opacity-70">{t('recentCommits')}</span>
          <Link href="/commits" className="link text-sm opacity-70">
            {t('viewAll')}
          </Link>
        </div>
        {recent.map((commit) => (
          <CommitListItem key={commit.id} commit={commit} />
        ))}
        {recent.length === 0 && <p className="p-8 text-center opacity-60">{t('empty')}</p>}
      </div>
    </div>
  );
}
```

주의: `WEEK_START` 를 모듈 레벨 상수로 두는 이유 — 렌더마다 `dayjs()` 를 새로 만들면 query key 가 흔들린다. 페이지 새로고침 기준으로 충분하다.

- [ ] **Step 4: `src/app/dashboard/page.tsx` 교체**

```tsx
import DashboardContents from './_components/DashboardContents';

export default function DashboardPage() {
  return <DashboardContents />;
}
```

- [ ] **Step 5: `yarn lint` → 통과. `yarn dev` 확인:** 타일 2개 값/증감, 막대 차트 7개(월~일), repo 분포, 바로가기 2버튼, 최근 커밋 5건 + 전체 보기 링크

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard src/shared/dayjs messages
git commit -m "feat: 대시보드 추가 (주간 통계 + 차트 + 최근 커밋)"
```

---

### Task 9: ReportPanel 공용 컴포넌트 + 일일 보고 페이지

**Files:**
- Create: `src/domain/commits/components/ReportPanel.tsx`
- Create: `src/app/reports/daily/_components/DailyReportContents.tsx`
- Modify: `src/app/reports/daily/page.tsx`
- Modify: `messages/ko.json`, `messages/en.json`

**Interfaces:**
- Consumes: `usePeriodCommits`, `CommitListItem`, `useWebLlm` (`onGenerate`, `status`, `progress`, `isStreaming`)
- Produces: `ReportPanel({ from: string; to: string })` — `from`/`to` 는 `YYYY-MM-DDTHH:mm:ss` 문자열. Task 10 주간 보고가 재사용.

- [ ] **Step 1: messages 에 report 문자열 추가**

`messages/ko.json`:

```json
"report": {
  "dailyTitle": "일일 보고",
  "weeklyTitle": "주간 작업 보고",
  "generate": "✨ 보고서 생성",
  "commits": "커밋 {count}건",
  "result": "생성된 보고서",
  "copy": "복사",
  "copied": "복사됨",
  "loading": "AI 모델 로딩 중 (최초 1회)",
  "unsupported": "이 브라우저는 AI 기능을 지원하지 않습니다. Chrome 사용을 권장합니다.",
  "empty": "해당 기간에 커밋이 없습니다.",
  "placeholder": "보고서 생성 버튼을 누르면 여기에 결과가 표시됩니다."
}
```

`messages/en.json`:

```json
"report": {
  "dailyTitle": "Daily Report",
  "weeklyTitle": "Weekly Report",
  "generate": "✨ Generate report",
  "commits": "{count} commits",
  "result": "Generated report",
  "copy": "Copy",
  "copied": "Copied",
  "loading": "Loading AI model (first time only)",
  "unsupported": "This browser does not support AI features. Chrome is recommended.",
  "empty": "No commits in this period.",
  "placeholder": "Press the generate button to see the result here."
}
```

- [ ] **Step 2: `src/domain/commits/components/ReportPanel.tsx` 작성**

```tsx
'use client';

import { useState } from 'react';

import { Commit } from '@/domain/commits/apis/commits.dto';
import CommitListItem from '@/domain/commits/components/CommitListItem';
import { usePeriodCommits } from '@/domain/commits/queries/commits';
import useWebLlm from '@/shared/components/llm/useWebLlm';

import { useTranslations } from 'next-intl';

const SYSTEM_PROMPT = `너는 개발자의 커밋 내역으로 업무 보고서를 작성하는 도우미다.
입력은 "저장소 | 커밋 메시지" 형식의 목록이다.
아래 마크다운 형식만 출력한다. 인사말이나 다른 설명은 절대 출력하지 않는다.

## {저장소 이름}

### {관련 커밋을 묶은 주제}

- 커밋 내용
- 커밋 내용

규칙:
- 저장소별로 ## 섹션을 만든다. 입력에 나온 저장소 순서를 유지한다.
- 각 저장소 안에서 관련 있는 커밋끼리 묶어 ### 주제 소제목을 붙인다.
- 커밋 메시지의 "feat:", "fix:", "refactor:" 같은 prefix 는 제거하고 내용만 쓴다.
- 커밋을 빠뜨리지 않는다. 없는 내용을 지어내지 않는다.`;

function toPromptInput(commits: Commit[]) {
  return commits
    .slice()
    .reverse() // 시간순 정렬 (조회는 최신순)
    .map((commit) => `${commit.repo} | ${commit.commitMessage}`)
    .join('\n');
}

export default function ReportPanel({ from, to }: Readonly<{ from: string; to: string }>) {
  // state
  const [report, setReport] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // hooks
  const t = useTranslations('report');
  const { status, progress, isStreaming, onGenerate } = useWebLlm();

  // queries
  const { commits, isLoading } = usePeriodCommits(from, to);

  // handle
  const handleGenerate = () => {
    setReport('');
    onGenerate({ system: SYSTEM_PROMPT, user: toPromptInput(commits), onDelta: setReport });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2_000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <span className="text-sm opacity-70">{t('commits', { count: commits.length })}</span>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={status !== 'ready' || isStreaming || isLoading || commits.length === 0}
          onClick={handleGenerate}
        >
          {isStreaming && <span className="loading loading-spinner loading-xs" />}
          {t('generate')}
        </button>
      </div>

      {status === 'unsupported' && <p className="text-warning text-sm">{t('unsupported')}</p>}
      {status === 'loading' && (
        <div className="flex flex-row items-center gap-2">
          <span className="text-xs opacity-60">{t('loading')}</span>
          <progress className="progress progress-primary flex-1" value={progress} max={1} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-base-200 rounded-box max-h-[32rem] overflow-y-auto shadow">
          {commits.map((commit) => (
            <CommitListItem key={commit.id} commit={commit} />
          ))}
          {!isLoading && commits.length === 0 && <p className="p-8 text-center opacity-60">{t('empty')}</p>}
        </div>

        <div className="bg-base-200 rounded-box flex max-h-[32rem] flex-col shadow">
          <div className="flex flex-row items-center justify-between p-4 pb-2">
            <span className="text-sm opacity-70">{t('result')}</span>
            <button type="button" className="btn btn-ghost btn-xs" disabled={!report} onClick={handleCopy}>
              📋 {isCopied ? t('copied') : t('copy')}
            </button>
          </div>
          <pre className="flex-1 overflow-y-auto p-4 pt-0 font-sans text-sm whitespace-pre-wrap">
            {report || <span className="opacity-50">{t('placeholder')}</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: `src/app/reports/daily/_components/DailyReportContents.tsx` 작성**

```tsx
'use client';

import { useState } from 'react';

import ReportPanel from '@/domain/commits/components/ReportPanel';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

export default function DailyReportContents() {
  // state
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // hooks
  const t = useTranslations('report');

  const from = dayjs(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const to = dayjs(date).endOf('day').format('YYYY-MM-DDTHH:mm:ss');

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('dailyTitle')}</h1>
        <input className="input input-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <ReportPanel from={from} to={to} />
    </div>
  );
}
```

- [ ] **Step 4: `src/app/reports/daily/page.tsx` 교체**

```tsx
import DailyReportContents from './_components/DailyReportContents';

export default function DailyReportPage() {
  return <DailyReportContents />;
}
```

- [ ] **Step 5: `yarn lint` → 통과. `yarn dev` 확인:** 날짜 변경 시 좌측 커밋 목록 갱신, 생성 버튼 → 우측 스트리밍 출력(repo별 `##`/`###` 형식), 복사 버튼, 커밋 0건 시 버튼 비활성

- [ ] **Step 6: Commit**

```bash
git add src/domain/commits/components/ReportPanel.tsx src/app/reports/daily messages
git commit -m "feat: 일일 보고 페이지 추가 (webLLM 보고서 생성)"
```

---

### Task 10: 주간 보고 페이지

**Files:**
- Create: `src/app/reports/weekly/_components/WeeklyReportContents.tsx`
- Modify: `src/app/reports/weekly/page.tsx`

**Interfaces:**
- Consumes: `ReportPanel` (Task 9), `dayjs` + isoWeek (Task 8)
- Produces: 없음 (최종 소비자)

- [ ] **Step 1: `src/app/reports/weekly/_components/WeeklyReportContents.tsx` 작성**

날짜 하나를 고르면 그 날짜가 속한 주(월~일)로 해석한다.

```tsx
'use client';

import { useState } from 'react';

import ReportPanel from '@/domain/commits/components/ReportPanel';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

export default function WeeklyReportContents() {
  // state
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // hooks
  const t = useTranslations('report');

  const weekStart = dayjs(date).startOf('isoWeek');
  const weekEnd = weekStart.endOf('isoWeek');

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('weeklyTitle')}</h1>
        <div className="flex flex-row items-center gap-2">
          <span className="badge badge-ghost">
            {weekStart.format('YYYY-MM-DD')} ~ {weekEnd.format('YYYY-MM-DD')}
          </span>
          <input className="input input-sm" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <ReportPanel from={weekStart.format('YYYY-MM-DDTHH:mm:ss')} to={weekEnd.format('YYYY-MM-DDTHH:mm:ss')} />
    </div>
  );
}
```

- [ ] **Step 2: `src/app/reports/weekly/page.tsx` 교체**

```tsx
import WeeklyReportContents from './_components/WeeklyReportContents';

export default function WeeklyReportPage() {
  return <WeeklyReportContents />;
}
```

- [ ] **Step 3: `yarn lint` → 통과. `yarn dev` 확인:** 아무 날짜 선택 → 월~일 범위 badge 표시, 해당 주 커밋 목록, 보고서 생성/복사

- [ ] **Step 4: Commit**

```bash
git add src/app/reports/weekly
git commit -m "feat: 주간 작업 보고 페이지 추가"
```

---

### Task 11: 최종 검증

**Files:** 수정 없음 (발견된 문제 수정만)

- [ ] **Step 1: `yarn lint` → 통과**

- [ ] **Step 2: `yarn build` → 성공** (실패 시 수정 후 재실행, 수정은 `fix:` 커밋)

- [ ] **Step 3: `yarn dev` 수동 체크리스트** (Chrome):
  - `/` → `/dashboard` redirect
  - 4개 라우트 렌더 + 헤더 active 표시
  - 테마 light/dark 전환 — 모든 페이지에서 배경/카드/버튼 색 확인
  - 모바일 폭(425px): 햄버거 메뉴, 챗봇 풀스크린
  - 커밋 목록: 필터 검색/초기화/무한 스크롤
  - 대시보드: 통계/차트/최근 커밋/바로가기
  - 일일·주간 보고: 기간 변경, 생성(스트리밍), 형식(repo별 `##`, 주제 `###`), 복사
  - 챗봇: 로딩 progress → 질문/답변
  - 아바타: 이미지 없을 때 이니셜 fallback
  - (가능하면) Safari 로 접속 → 챗봇/보고서에 미지원 안내, 커밋 조회는 정상

- [ ] **Step 4: 수동 체크에서 발견된 문제를 수정하고 커밋** (`fix:` prefix)

---

## Self-Review 결과 (작성 시 반영 완료)

- 스펙 커버리지: 라우팅(T4), 헤더/nav/아바타(T5), 챗봇(T6), 대시보드 전 위젯(T8), 커밋 목록(T7), 일일/주간 보고(T9/T10), 테마(T1), useWebLlm 정리(T3), i18n(각 태스크), 에러/빈 상태(각 태스크) — 전부 태스크에 매핑됨.
- 스펙의 "API 에러 toast" 는 별도 태스크로 만들지 않음 — 조회 실패 시 빈 상태 + React Query 재시도로 충분하고, 기존 코드베이스(useUsers 등)도 조회 에러를 toast 하지 않는 패턴. mutation 이 없는 화면들이라 대상이 없음.
- 타입 일관성: `Commit.createdDate` 는 `string` (JSON 그대로) — 모든 소비처가 `dayjs(...)` 로 파싱. `ReportPanel` 의 `from`/`to` 는 `YYYY-MM-DDTHH:mm:ss` 문자열로 통일.
